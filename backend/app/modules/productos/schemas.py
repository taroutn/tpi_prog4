from typing import Optional
from sqlmodel import Field, SQLModel
from app.modules.categorias.schemas import CategoriaRead


class ProductoCreate(SQLModel):
    nombre: str = Field(min_length=1, max_length=150)
    descripcion: Optional[str] = None
    precio_base: float = Field(ge=0)
    imagen_url: Optional[str] = None
    stock: int = Field(default=0, ge=0)
    disponible: bool = Field(default=True)
    categoria_id: int


class ProductoUpdate(SQLModel):
    nombre: Optional[str] = Field(default=None, min_length=1, max_length=150)
    descripcion: Optional[str] = None
    precio_base: Optional[float] = Field(default=None, ge=0)
    imagen_url: Optional[str] = None
    stock: Optional[int] = Field(default=None, ge=0)
    disponible: Optional[bool] = None
    categoria_id: Optional[int] = None


class ProductoStockUpdate(SQLModel):
    stock: int = Field(ge=0)
    disponible: bool


class ProductoRead(SQLModel):
    id: int
    nombre: str
    descripcion: Optional[str] = None
    precio_base: float
    imagen_url: Optional[str] = None
    stock: int
    disponible: bool
    activo: bool
    categoria_id: int
    categoria: Optional[CategoriaRead] = None


class ProductosPaginados(SQLModel):
    total: int
    items: list[ProductoRead]