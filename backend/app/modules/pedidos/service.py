from datetime import datetime, timezone
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    CambioEstado,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.models import Usuario


class PedidoNoEncontrado(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class ProductoRepetido(Exception):
    pass


class ProductoNoDisponible(Exception):
    pass


class StockInsuficiente(Exception):
    pass


class TransicionInvalida(Exception):
    pass


TRANSICIONES_VALIDAS: dict[str, set[str]] = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    def crear_pedido(
        self, data: PedidoCreate, usuario_actual: Usuario
    ) -> PedidoRead:
        assert usuario_actual.id is not None

        with self.uow as uow:
            productos_vistos: set[int] = set()
            for item in data.items:
                if item.producto_id in productos_vistos:
                    raise ProductoRepetido(
                        f"El producto con ID {item.producto_id} está repetido en el pedido"
                    )
                productos_vistos.add(item.producto_id)

            ahora = datetime.now(timezone.utc)
            nuevo_pedido = Pedido(
                usuario_id=usuario_actual.id,
                estado="PENDIENTE",
                forma_pago=data.forma_pago,
                direccion_entrega=data.direccion_entrega,
                notas=data.notas,
                total=0.0,
                created_at=ahora,
                updated_at=ahora,
            )
            uow.pedidos.add(nuevo_pedido)
            assert nuevo_pedido.id is not None

            total_acumulado = 0.0

            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if not producto or not producto.activo:
                    raise ProductoNoEncontrado(
                        f"El producto con ID {item.producto_id} no existe o está inactivo"
                    )

                if not producto.disponible:
                    raise ProductoNoDisponible(
                        f"El producto '{producto.nombre}' no está disponible actualmente"
                    )

                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para '{producto.nombre}' (disponible: {producto.stock}, solicitado: {item.cantidad})"
                    )

                producto.stock -= item.cantidad
                assert uow.session is not None
                uow.session.add(producto)

                subtotal = round(producto.precio_base * item.cantidad, 2)
                detalle = DetallePedido(
                    pedido_id=nuevo_pedido.id,
                    producto_id= item.producto_id,
                    cantidad=item.cantidad,
                    nombre_producto=producto.nombre,
                    precio_unitario=producto.precio_base,
                    subtotal=subtotal,
                )
                uow.pedidos.add_detalle(detalle)
                total_acumulado = round(total_acumulado + subtotal, 2)

            nuevo_pedido.total = total_acumulado
            assert uow.session is not None
            uow.session.add(nuevo_pedido)
            uow.session.flush()
            uow.session.refresh(nuevo_pedido)

            return PedidoRead.model_validate(nuevo_pedido)

    def listar_pedidos(
        self,
        usuario_actual: Usuario,
        skip: int = 0,
        limit: int = 20,
        estado: str | None = None,
    ) -> PedidosPaginados:
        with self.uow as uow:
            filtro_usuario_id = (
                None if usuario_actual.role == "admin" else usuario_actual.id
            )
            total, items = uow.pedidos.list_by_usuario(
                usuario_id=filtro_usuario_id,
                estado=estado,
                skip=skip,
                limit=limit,
            )
            items_read = [PedidoRead.model_validate(p) for p in items]
            return PedidosPaginados(total=total, items=items_read)

    def obtener_pedido(
        self, pedido_id: int, usuario_actual: Usuario
    ) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if not pedido:
                raise PedidoNoEncontrado("Pedido no encontrado")

            if (
                usuario_actual.role != "admin"
                and pedido.usuario_id != usuario_actual.id
            ):
                raise PedidoAjeno("No tienes permiso para acceder a este pedido")

            return PedidoRead.model_validate(pedido)

    def cambiar_estado_admin(
        self, pedido_id: int, data: CambioEstado
    ) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if not pedido:
                raise PedidoNoEncontrado("Pedido no encontrado")

            nuevo_estado = data.estado
            estados_permitidos = TRANSICIONES_VALIDAS.get(pedido.estado, set())

            if nuevo_estado not in estados_permitidos:
                raise TransicionInvalida(
                    f"No se puede pasar un pedido de '{pedido.estado}' a '{nuevo_estado}'"
                )

            if nuevo_estado == "CANCELADO":
                self._restituir_stock(uow, pedido)

            pedido.estado = nuevo_estado
            pedido.updated_at = datetime.now(timezone.utc)

            assert uow.session is not None
            uow.session.add(pedido)
            uow.session.flush()
            uow.session.refresh(pedido)

            return PedidoRead.model_validate(pedido)

    def cancelar_pedido_cliente(
        self, pedido_id: int, usuario_actual: Usuario
    ) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if not pedido:
                raise PedidoNoEncontrado("Pedido no encontrado")

            if (
                usuario_actual.role != "admin"
                and pedido.usuario_id != usuario_actual.id
            ):
                raise PedidoAjeno(
                    "No tienes permiso para cancelar un pedido de otro usuario"
                )

            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida(
                    "Solo se pueden cancelar pedidos que estén en estado PENDIENTE"
                )

            self._restituir_stock(uow, pedido)

            pedido.estado = "CANCELADO"
            pedido.updated_at = datetime.now(timezone.utc)

            assert uow.session is not None
            uow.session.add(pedido)
            uow.session.flush()
            uow.session.refresh(pedido)

            return PedidoRead.model_validate(pedido)

    def obtener_resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            pendientes = uow.pedidos.count_by_estado("PENDIENTE")
            en_preparacion = uow.pedidos.count_by_estado("EN_PREPARACION")
            entregados = uow.pedidos.count_by_estado("ENTREGADO")
            cancelados = uow.pedidos.count_by_estado("CANCELADO")
            pedidos_hoy = uow.pedidos.count_pedidos_hoy()
            ingresos_entregados = round(
                uow.pedidos.sum_ingresos_entregados(), 2
            )

            return ResumenPedidos(
                pendientes=pendientes,
                en_preparacion=en_preparacion,
                entregados=entregados,
                cancelados=cancelados,
                pedidos_hoy=pedidos_hoy,
                ingresos_entregados=ingresos_entregados,
            )

    @staticmethod
    def _restituir_stock(uow: PedidoUnitOfWork, pedido: Pedido) -> None:
        assert uow.session is not None
        for linea in pedido.items:
            producto = uow.productos.get_by_id(linea.producto_id)
            if producto:
                producto.stock += linea.cantidad
                uow.session.add(producto)