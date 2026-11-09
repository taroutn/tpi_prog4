from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(Exception):
    pass


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork) -> None:
        self.uow = uow

    def listar_productos(
        self,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, items = uow.productos.search(
                skip=skip,
                limit=limit,
                search=search,
                categoria_id=categoria_id,
                disponible=disponible,
            )
            items_read = [ProductoRead.model_validate(p) for p in items]
            return ProductosPaginados(total=total, items=items_read)

    def obtener_por_id(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)
            if not producto or not producto.activo:
                raise ProductoNoEncontrado("Producto no encontrado")
            return ProductoRead.model_validate(producto)

    def crear(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(data.categoria_id)
            if not categoria or not categoria.activo:
                raise CategoriaNoEncontrada(
                    "La categoría indicada no existe o está dada de baja"
                )

            nuevo = Producto(
                nombre=data.nombre,
                descripcion=data.descripcion,
                precio_base=data.precio_base,
                imagen_url=data.imagen_url,
                stock=data.stock,
                disponible=data.disponible,
                categoria_id=data.categoria_id,
                activo=True,
            )
            uow.productos.add(nuevo)
            return ProductoRead.model_validate(nuevo)

    def actualizar(
        self, producto_id: int, data: ProductoUpdate
    ) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)
            if not producto or not producto.activo:
                raise ProductoNoEncontrado("Producto no encontrado")

            campos = data.model_dump(exclude_unset=True)

            if "categoria_id" in campos and campos["categoria_id"] is not None:
                nueva_cat_id = campos["categoria_id"]
                categoria = uow.categorias.get_by_id(nueva_cat_id)
                if not categoria or not categoria.activo:
                    raise CategoriaNoEncontrada(
                        "La nueva categoría no existe o está dada de baja"
                    )

            for campo, valor in campos.items():
                setattr(producto, campo, valor)

            assert uow.session is not None
            uow.session.add(producto)
            uow.session.flush()
            uow.session.refresh(producto)
            return ProductoRead.model_validate(producto)

    def actualizar_stock(
        self, producto_id: int, data: ProductoStockUpdate
    ) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)
            if not producto or not producto.activo:
                raise ProductoNoEncontrado("Producto no encontrado")

            producto.stock = data.stock
            producto.disponible = data.disponible

            assert uow.session is not None
            uow.session.add(producto)
            uow.session.flush()
            uow.session.refresh(producto)
            return ProductoRead.model_validate(producto)

    def eliminar(self, producto_id: int) -> None:
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)
            if not producto or not producto.activo:
                raise ProductoNoEncontrado("Producto no encontrado")

            producto.activo = False
            assert uow.session is not None
            uow.session.add(producto)
            uow.session.flush()