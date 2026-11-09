from sqlmodel import SQLModel
from app.modules.usuarios.schemas import UserCreate, UserPublic


class AuthMessage(SQLModel):
    message: str


__all__ = ["UserCreate", "UserPublic", "AuthMessage"]