import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  actualizarProducto,
  actualizarStockProducto,
  crearProducto,
  eliminarProducto,
  getProductos,
} from '../api/productos.api';
import type { FiltrosProductos } from '../types/producto.types';

export const useProductos = (filtros: FiltrosProductos) => {
  return useQuery({
    queryKey: ['productos', filtros],
    queryFn: () => getProductos(filtros),
  });
};

export const useCrearProducto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearProducto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
};

export const useActualizarProducto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: actualizarProducto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
};

export const useActualizarStockProducto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: actualizarStockProducto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
};

export const useEliminarProducto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eliminarProducto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
};