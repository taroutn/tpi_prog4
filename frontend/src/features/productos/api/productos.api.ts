import { axiosInstance } from '../../../shared/api/axiosInstance';
import type {
  FiltrosProductos,
  Producto,
  ProductoCreate,
  ProductosPaginados,
  ProductoStockUpdate,
  ProductoUpdate,
} from '../types/producto.types';

export const getProductos = async (
  filtros: FiltrosProductos
): Promise<ProductosPaginados> => {
  const params: Record<string, string | number | boolean> = {
    skip: filtros.skip ?? 0,
    limit: filtros.limit ?? 20,
  };
  if (filtros.search && filtros.search.trim()) {
    params.search = filtros.search.trim();
  }
  if (filtros.categoria_id !== undefined) {
    params.categoria_id = filtros.categoria_id;
  }
  if (filtros.disponible !== undefined) {
    params.disponible = filtros.disponible;
  }

  const { data } = await axiosInstance.get<ProductosPaginados>('/productos', {
    params,
  });
  return data;
};

export const crearProducto = async (
  payload: ProductoCreate
): Promise<Producto> => {
  const { data } = await axiosInstance.post<Producto>('/productos', payload);
  return data;
};

export const actualizarProducto = async ({
  id,
  payload,
}: {
  id: number;
  payload: ProductoUpdate;
}): Promise<Producto> => {
  const { data } = await axiosInstance.put<Producto>(
    `/productos/${id}`,
    payload
  );
  return data;
};

export const actualizarStockProducto = async ({
  id,
  payload,
}: {
  id: number;
  payload: ProductoStockUpdate;
}): Promise<Producto> => {
  const { data } = await axiosInstance.patch<Producto>(
    `/productos/${id}/stock`,
    payload
  );
  return data;
};

export const eliminarProducto = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/productos/${id}`);
};