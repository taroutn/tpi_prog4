from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.usuarios.models import Usuario
    from app.modules.productos.models import Producto


class Pedido(SQLModel, table=True):
    __tablename__ = "pedido"

    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", nullable=False)
    estado: str = Field(default="PENDIENTE", nullable=False)
    forma_pago: str = Field(nullable=False)
    direccion_entrega: str = Field(min_length=5, max_length=200, nullable=False)
    notas: Optional[str] = Field(default=None)
    total: float = Field(default=0.0, nullable=False)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    usuario: Optional["Usuario"] = Relationship(back_populates="pedidos")
    items: list["DetallePedido"] = Relationship(back_populates="pedido")


class DetallePedido(SQLModel, table=True):
    __tablename__ = "detalle_pedido"

    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id", nullable=False)
    producto_id: int = Field(foreign_key="producto.id", nullable=False)
    cantidad: int = Field(ge=1, nullable=False)
    nombre_producto: str = Field(nullable=False)
    precio_unitario: float = Field(nullable=False)
    subtotal: float = Field(nullable=False)

    pedido: Optional["Pedido"] = Relationship(back_populates="items")
    producto: Optional["Producto"] = Relationship(back_populates="detalles")