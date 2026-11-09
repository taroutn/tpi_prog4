from fastapi import APIRouter, Depends, HTTPException, status
from app.core.deps import require_role
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import (
    AutoDesactivacionNoPermitida,
    UsuarioNoEncontrado,
    UsuarioService,
)
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/admin/usuarios", tags=["Administración - Usuarios"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


@router.get("", response_model=list[UserPublic])
def listar_usuarios(
    _admin: Usuario = Depends(require_role(["admin"])),
    service: UsuarioService = Depends(get_usuario_service),
) -> list[UserPublic]:
    return service.listar_usuarios()


@router.post("/{id}/activar", response_model=UserPublic)
def activar_usuario(
    id: int,
    _admin: Usuario = Depends(require_role(["admin"])),
    service: UsuarioService = Depends(get_usuario_service),
) -> UserPublic:
    try:
        return service.activar_usuario(id)
    except UsuarioNoEncontrado as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(e)
        )


@router.post("/{id}/desactivar", response_model=UserPublic)
def desactivar_usuario(
    id: int,
    admin_actual: Usuario = Depends(require_role(["admin"])),
    service: UsuarioService = Depends(get_usuario_service),
) -> UserPublic:
    try:
        assert admin_actual.id is not None
        return service.desactivar_usuario(id, admin_actual.id)
    except UsuarioNoEncontrado as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(e)
        )
    except AutoDesactivacionNoPermitida as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        )