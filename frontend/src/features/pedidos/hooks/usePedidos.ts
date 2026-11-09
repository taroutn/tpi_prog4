import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cambiarEstadoPedidoAdmin,
  cancelarPedidoCliente,
  crearPedido,
  getPedidos,
  getResumenPedidos,
} from '../api/pedidos.api';
import type { FiltrosPedidos } from '../types/pedido.types';

export const usePedidos = (filtros: FiltrosPedidos = {}) => {
  return useQuery({
    queryKey: ['pedidos', filtros],
    queryFn: () => getPedidos(filtros),
  });
};

export const useCrearPedido = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearPedido,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      queryClient.invalidateQueries({ queryKey: ['resumen-pedidos'] });
    },
  });
};

export const useCancelarPedido = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelarPedidoCliente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      queryClient.invalidateQueries({ queryKey: ['resumen-pedidos'] });
    },
  });
};

export const useCambiarEstadoPedido = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cambiarEstadoPedidoAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      queryClient.invalidateQueries({ queryKey: ['resumen-pedidos'] });
    },
  });
};

export const useResumenPedidos = () => {
  return useQuery({
    queryKey: ['resumen-pedidos'],
    queryFn: getResumenPedidos,
  });
};