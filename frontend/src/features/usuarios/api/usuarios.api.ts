import { axiosInstance } from '../../../shared/api/axiosInstance';
import type { UsuarioAdmin } from '../types/usuario.types';

export const getUsuariosAdmin = async (): Promise<UsuarioAdmin[]> => {
  const { data } = await axiosInstance.get<UsuarioAdmin[]>('/admin/usuarios');
  return data;
};

export const activarUsuarioAdmin = async (id: number): Promise<UsuarioAdmin> => {
  const { data } = await axiosInstance.post<UsuarioAdmin>(
    `/admin/usuarios/${id}/activar`
  );
  return data;
};

export const desactivarUsuarioAdmin = async (
  id: number
): Promise<UsuarioAdmin> => {
  const { data } = await axiosInstance.post<UsuarioAdmin>(
    `/admin/usuarios/${id}/desactivar`
  );
  return data;
};