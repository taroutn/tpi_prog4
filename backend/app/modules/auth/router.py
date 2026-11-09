from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from app.core.config import settings
from app.core.deps import get_current_active_user
from app.modules.auth.schemas import AuthMessage, UserCreate, UserPublic
from app.modules.auth.service import (
    AuthService,
    CredencialesInvalidas,
    CuentaDesactivada,
    UsuarioDuplicado,
)
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/auth", tags=["Autenticación"])


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


@router.post(
    "/register",
    response_model=UserPublic,
    status_code=status.HTTP_201_CREATED,
)
def register(
    data: UserCreate,
    service: AuthService = Depends(get_auth_service),
) -> UserPublic:
    try:
        return service.registrar_usuario(data)
    except UsuarioDuplicado as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=str(e)
        )


@router.post("/token", response_model=AuthMessage)
def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    service: AuthService = Depends(get_auth_service),
) -> AuthMessage:
    try:
        token = service.autenticar_y_crear_token(
            form_data.username, form_data.password
        )
    except CredencialesInvalidas as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e)
        )
    except CuentaDesactivada as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        )

    max_age = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=max_age,
        expires=max_age,
        samesite="lax",
        secure=False,  # POR AHORA QUEDA EN FALSE
        path="/",
    )
    return AuthMessage(message="Login exitoso")


@router.post("/logout", response_model=AuthMessage)
def logout(response: Response) -> AuthMessage:
    response.delete_cookie(
        key="access_token",
        httponly=True,
        samesite="lax",
        secure=False,
        path="/",
    )
    return AuthMessage(message="Logout exitoso")


@router.get("/me", response_model=UserPublic)
def read_users_me(
    current_user: Usuario = Depends(get_current_active_user),
) -> UserPublic:
    return UserPublic.model_validate(current_user)