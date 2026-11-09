import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
}

interface CartState {
  items: CartItem[];
  agregar: (item: CartItem) => void;
  quitar: (producto_id: number) => void;
  cambiarCantidad: (producto_id: number, cantidad: number) => void;
  vaciar: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      agregar: (nuevoItem) => {
        set((state) => {
          const existe = state.items.find((i) => i.producto_id === nuevoItem.producto_id);
          if (existe) {
            return {
              items: state.items.map((i) =>
                i.producto_id === nuevoItem.producto_id
                  ? { ...i, cantidad: i.cantidad + nuevoItem.cantidad }
                  : i
              ),
            };
          }
          return { items: [...state.items, nuevoItem] };
        });
      },
      quitar: (producto_id) => {
        set((state) => ({
          items: state.items.filter((i) => i.producto_id !== producto_id),
        }));
      },
      cambiarCantidad: (producto_id, cantidad) => {
        if (cantidad < 1) return;
        set((state) => ({
          items: state.items.map((i) =>
            i.producto_id === producto_id ? { ...i, cantidad } : i
          ),
        }));
      },
      vaciar: () => set({ items: [] }),
      total: () => {
        return get().items.reduce(
          (sum, item) => sum + item.precio_unitario * item.cantidad,
          0
        );
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);