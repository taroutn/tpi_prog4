from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.core.deps import get_current_active_user, require_role
from app.modules.pedidos.schemas import (
    CambioEstado,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoDisponible,
    ProductoRepetido,
    StockInsuficiente,
    TransicionInvalida,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


@router.post(
    "",
    response_model=PedidoRead,
    status_code=status.HTTP_201_CREATED,
)
def crear_pedido(
    data: PedidoCreate,
    current_user: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return service.crear_pedido(data, current_user)
    except ProductoNoEncontrado as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(e)
        )
    except (
        ProductoRepetido,
        ProductoNoDisponible,
        StockInsuficiente,
    ) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        )


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    estado: str | None = Query(default=None),
    current_user: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidosPaginados:
    return service.listar_pedidos(
        usuario_actual=current_user,
        skip=skip,
        limit=limit,
        estado=estado,
    )


@router.get("/resumen", response_model=ResumenPedidos)
def obtener_resumen_pedidos(
    _admin: Usuario = Depends(require_role(["admin"])),
    service: PedidoService = Depends(get_pedido_service),
) -> ResumenPedidos:
    return service.obtener_resumen()


@router.get("/{id}", response_model=PedidoRead)
def obtener_pedido(
    id: int,
    current_user: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return service.obtener_pedido(id, current_user)
    except PedidoNoEncontrado as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(e)
        )
    except PedidoAjeno as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail=str(e)
        )


@router.patch("/{id}/estado", response_model=PedidoRead)
def cambiar_estado_pedido(
    id: int,
    data: CambioEstado,
    _admin: Usuario = Depends(require_role(["admin"])),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return service.cambiar_estado_admin(id, data)
    except PedidoNoEncontrado as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(e)
        )
    except TransicionInvalida as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        )


@router.patch("/{id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(
    id: int,
    current_user: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return service.cancelar_pedido_cliente(id, current_user)
    except PedidoNoEncontrado as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(e)
        )
    except PedidoAjeno as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail=str(e)
        )
    except TransicionInvalida as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        )