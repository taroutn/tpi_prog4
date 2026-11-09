from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    pass


class NombreDuplicado(Exception):
    pass


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    def listar_activas(self) -> list[CategoriaRead]:
        with self.uow as uow:
            categorias = uow.categorias.get_activas()
            return [CategoriaRead.model_validate(c) for c in categorias]

    def obtener_por_id(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)
            if not categoria or not categoria.activo:
                raise CategoriaNoEncontrada("Categoría no encontrada")
            return CategoriaRead.model_validate(categoria)

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            existente = uow.categorias.get_by_nombre(data.nombre)
            if existente:
                raise NombreDuplicado(
                    f"Ya existe una categoría con el nombre '{data.nombre}'"
                )

            nueva = Categoria(
                nombre=data.nombre,
                descripcion=data.descripcion,
                activo=True,
            )
            uow.categorias.add(nueva)
            return CategoriaRead.model_validate(nueva)

    def actualizar(
        self, categoria_id: int, data: CategoriaUpdate
    ) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)
            if not categoria or not categoria.activo:
                raise CategoriaNoEncontrada("Categoría no encontrada")

            campos = data.model_dump(exclude_unset=True)

            if "nombre" in campos and campos["nombre"] is not None:
                nuevo_nombre = campos["nombre"]
                if nuevo_nombre != categoria.nombre:
                    existente = uow.categorias.get_by_nombre(nuevo_nombre)
                    if existente and existente.id != categoria_id:
                        raise NombreDuplicado(
                            f"Ya existe una categoría con el nombre '{nuevo_nombre}'"
                        )

            for campo, valor in campos.items():
                setattr(categoria, campo, valor)

            assert uow.session is not None
            uow.session.add(categoria)
            uow.session.flush()
            uow.session.refresh(categoria)
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, categoria_id: int) -> None:
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)
            if not categoria or not categoria.activo:
                raise CategoriaNoEncontrada("Categoría no encontrada")

            categoria.activo = False
            assert uow.session is not None
            uow.session.add(categoria)
            uow.session.flush()