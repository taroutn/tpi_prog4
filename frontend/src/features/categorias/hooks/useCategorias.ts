import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  actualizarCategoria,
  crearCategoria,
  eliminarCategoria,
  getCategorias,
} from '../api/categorias.api';

export const useCategorias = () => {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: getCategorias,
  });
};

export const useCrearCategoria = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearCategoria,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });
};

export const useActualizarCategoria = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: actualizarCategoria,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
};

export const useEliminarCategoria = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eliminarCategoria,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });
};