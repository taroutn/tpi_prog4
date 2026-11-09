from datetime import datetime
from typing import Literal, Optional
from sqlmodel import Field, SQLModel

FormaPagoValida = Literal["EFECTIVO", "TRANSFERENCIA"]
EstadoPedidoValido = Literal[
    "PENDIENTE", "EN_PREPARACION", "ENTREGADO", "CANCELADO"
]


class ItemPedidoCreate(SQLModel):
    producto_id: int
    cantidad: int = Field(ge=1)


class PedidoCreate(SQLModel):
    items: list[ItemPedidoCreate] = Field(min_length=1)
    forma_pago: FormaPagoValida
    direccion_entrega: str = Field(min_length=5, max_length=200)
    notas: Optional[str] = None


class DetallePedidoRead(SQLModel):
    producto_id: int
    nombre_producto: str
    precio_unitario: float
    cantidad: int
    subtotal: float


class PedidoRead(SQLModel):
    id: int
    usuario_id: int
    estado: str
    forma_pago: str
    direccion_entrega: str
    notas: Optional[str] = None
    total: float
    created_at: datetime
    updated_at: datetime
    items: list[DetallePedidoRead] = []


class PedidosPaginados(SQLModel):
    total: int
    items: list[PedidoRead]


class CambioEstado(SQLModel):
    estado: EstadoPedidoValido


class ResumenPedidos(SQLModel):
    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: float