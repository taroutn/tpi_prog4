import { axiosInstance } from '../../../shared/api/axiosInstance';
import type {
  EstadoPedido,
  FiltrosPedidos,
  Pedido,
  PedidoCreate,
  PedidosPaginados,
  ResumenPedidos,
} from '../types/pedido.types';

export const crearPedido = async (payload: PedidoCreate): Promise<Pedido> => {
  const { data } = await axiosInstance.post<Pedido>('/pedidos', payload);
  return data;
};

export const getPedidos = async (
  filtros: FiltrosPedidos = {}
): Promise<PedidosPaginados> => {
  const params: Record<string, string | number> = {
    skip: filtros.skip ?? 0,
    limit: filtros.limit ?? 20,
  };
  if (filtros.estado) {
    params.estado = filtros.estado;
  }
  const { data } = await axiosInstance.get<PedidosPaginados>('/pedidos', {
    params,
  });
  return data;
};

export const getPedidoById = async (id: number): Promise<Pedido> => {
  const { data } = await axiosInstance.get<Pedido>(`/pedidos/${id}`);
  return data;
};

export const cancelarPedidoCliente = async (id: number): Promise<Pedido> => {
  const { data } = await axiosInstance.patch<Pedido>(`/pedidos/${id}/cancelar`);
  return data;
};

export const cambiarEstadoPedidoAdmin = async ({
  id,
  estado,
}: {
  id: number;
  estado: EstadoPedido;
}): Promise<Pedido> => {
  const { data } = await axiosInstance.patch<Pedido>(`/pedidos/${id}/estado`, {
    estado,
  });
  return data;
};

export const getResumenPedidos = async (): Promise<ResumenPedidos> => {
  const { data } = await axiosInstance.get<ResumenPedidos>('/pedidos/resumen');
  return data;
};