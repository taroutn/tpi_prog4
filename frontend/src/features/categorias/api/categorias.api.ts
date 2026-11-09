import { axiosInstance } from '../../../shared/api/axiosInstance';
import type {
  Categoria,
  CategoriaCreate,
  CategoriaUpdate,
} from '../types/categoria.types';

export const getCategorias = async (): Promise<Categoria[]> => {
  const { data } = await axiosInstance.get<Categoria[]>('/categorias');
  return data;
};

export const crearCategoria = async (
  payload: CategoriaCreate
): Promise<Categoria> => {
  const { data } = await axiosInstance.post<Categoria>('/categorias', payload);
  return data;
};

export const actualizarCategoria = async ({
  id,
  payload,
}: {
  id: number;
  payload: CategoriaUpdate;
}): Promise<Categoria> => {
  const { data } = await axiosInstance.put<Categoria>(
    `/categorias/${id}`,
    payload
  );
  return data;
};

export const eliminarCategoria = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/categorias/${id}`);
};