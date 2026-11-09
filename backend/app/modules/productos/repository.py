from sqlmodel import Session, col, func, select
from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)

    def search(
        self,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> tuple[int, list[Producto]]:
        filtros = [Producto.activo == True]

        if search and search.strip():
            termino = f"%{search.strip()}%"
            filtros.append(col(Producto.nombre).ilike(termino))

        if categoria_id is not None:
            filtros.append(Producto.categoria_id == categoria_id)

        if disponible is not None:
            filtros.append(Producto.disponible == disponible)

        count_stmt = select(func.count()).select_from(Producto).where(*filtros)
        total = int(self.session.exec(count_stmt).one())

        items_stmt = (
            select(Producto)
            .where(*filtros)
            .order_by(Producto.id)
            .offset(skip)
            .limit(limit)
        )
        items = list(self.session.exec(items_stmt).all())

        return total, items