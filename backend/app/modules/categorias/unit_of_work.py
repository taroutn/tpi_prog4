from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.repository import CategoriaRepository


class CategoriaUnitOfWork(UnitOfWork):
    categorias: CategoriaRepository

    def __enter__(self) -> "CategoriaUnitOfWork":
        super().__enter__()
        assert self.session is not None
        self.categorias = CategoriaRepository(self.session)
        return self