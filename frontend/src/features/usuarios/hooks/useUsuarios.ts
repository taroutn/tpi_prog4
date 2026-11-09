import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  activarUsuarioAdmin,
  desactivarUsuarioAdmin,
  getUsuariosAdmin,
} from '../api/usuarios.api';

export const useUsuarios = () => {
  return useQuery({
    queryKey: ['admin-usuarios'],
    queryFn: getUsuariosAdmin,
  });
};

export const useActivarUsuario = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: activarUsuarioAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-usuarios'] });
    },
  });
};

export const useDesactivarUsuario = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: desactivarUsuarioAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-usuarios'] });
    },
  });
};