import type { Categoria } from '../../categorias/types/categoria.types';

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  imagen_url: string | null;
  stock: number;
  disponible: boolean;
  activo: boolean;
  categoria_id: number;
  categoria?: Categoria | null;
}

export interface ProductosPaginados {
  total: number;
  items: Producto[];
}

export interface FiltrosProductos {
  skip?: number;
  limit?: number;
  search?: string;
  categoria_id?: number;
  disponible?: boolean;
}

export interface ProductoCreate {
  nombre: string;
  descripcion?: string | null;
  precio_base: number;
  imagen_url?: string | null;
  stock: number;
  disponible: boolean;
  categoria_id: number;
}

export interface ProductoUpdate {
  nombre?: string;
  descripcion?: string | null;
  precio_base?: number;
  imagen_url?: string | null;
  stock?: number;
  disponible?: boolean;
  categoria_id?: number;
}

export interface ProductoStockUpdate {
  stock: number;
  disponible: boolean;
}