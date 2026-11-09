from datetime import timedelta
from app.core.config import settings
from app.core.security import (
    create_access_token,
    get_password_hash,
    verify_password,
)
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioDuplicado(Exception):
    pass


class CredencialesInvalidas(Exception):
    pass


class CuentaDesactivada(Exception):
    pass


class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def registrar_usuario(self, data: UserCreate) -> UserPublic:
        with self.uow as uow:
            if uow.usuarios.get_by_username(data.username):
                raise UsuarioDuplicado("El nombre de usuario ya está registrado")
            if uow.usuarios.get_by_email(data.email):
                raise UsuarioDuplicado("El correo electrónico ya está registrado")

            nuevo_usuario = Usuario(
                username=data.username,
                full_name=data.full_name,
                email=data.email,
                hashed_password=get_password_hash(data.password),
                role="user",
                disabled=False,
            )
            uow.usuarios.add(nuevo_usuario)
            return UserPublic.model_validate(nuevo_usuario)

    def autenticar_y_crear_token(self, username: str, password: str) -> str:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            if not usuario or not verify_password(
                password, usuario.hashed_password
            ):
                raise CredencialesInvalidas(
                    "Usuario o contraseña incorrectos"
                )

            if usuario.disabled:
                raise CuentaDesactivada("Cuenta de usuario desactivada")

            expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
            return create_access_token(
                data={"sub": usuario.username, "role": usuario.role},
                expires_delta=expires,
            )