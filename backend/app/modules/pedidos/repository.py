from datetime import datetime, timezone
from sqlmodel import Session, func, select
from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import DetallePedido, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    def add_detalle(self, detalle: DetallePedido) -> DetallePedido:
        self.session.add(detalle)
        self.session.flush()
        self.session.refresh(detalle)
        return detalle

    def list_by_usuario(
        self,
        usuario_id: int | None = None,
        estado: str | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[int, list[Pedido]]:
        filtros = []
        if usuario_id is not None:
            filtros.append(Pedido.usuario_id == usuario_id)
        if estado is not None and estado.strip():
            filtros.append(Pedido.estado == estado.strip())

        count_stmt = select(func.count()).select_from(Pedido)
        if filtros:
            count_stmt = count_stmt.where(*filtros)
        total = int(self.session.exec(count_stmt).one())

        items_stmt = select(Pedido)
        if filtros:
            items_stmt = items_stmt.where(*filtros)
        items_stmt = (
            items_stmt.order_by(Pedido.created_at.desc(), Pedido.id.desc())
            .offset(skip)
            .limit(limit)
        )
        items = list(self.session.exec(items_stmt).all())

        return total, items

    def count_by_estado(self, estado: str) -> int:
        stmt = (
            select(func.count())
            .select_from(Pedido)
            .where(Pedido.estado == estado)
        )
        return int(self.session.exec(stmt).one())

    def count_pedidos_hoy(self) -> int:
        ahora = datetime.now(timezone.utc)
        inicio_hoy_utc = datetime(
            ahora.year, ahora.month, ahora.day, tzinfo=timezone.utc
        )
        inicio_hoy_naive = inicio_hoy_utc.replace(tzinfo=None)

        stmt = (
            select(func.count())
            .select_from(Pedido)
            .where(Pedido.created_at >= inicio_hoy_naive)
        )
        return int(self.session.exec(stmt).one())

    def sum_ingresos_entregados(self) -> float:
        stmt = select(func.coalesce(func.sum(Pedido.total), 0.0)).where(
            Pedido.estado == "ENTREGADO"
        )
        resultado = self.session.exec(stmt).one()
        return float(resultado or 0.0)