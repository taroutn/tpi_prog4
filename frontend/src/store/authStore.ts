import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { axiosInstance } from '../shared/api/axiosInstance';

export interface Usuario {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: string;
  disabled: boolean;
}

interface AuthState {
  usuario: Usuario | null;
  cargando: boolean;
  login: (usuario: Usuario) => void;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,
      login: (usuario) => set({ usuario, cargando: false }),
      logout: async () => {
        try {
          await axiosInstance.post('/auth/logout');
        } catch (error) {
          console.error('Error al cerrar sesión', error);
        } finally {
          set({ usuario: null, cargando: false });
          window.location.href = '/login';
        }
      },
      checkSession: async () => {
        set({ cargando: true });
        try {
          const { data } = await axiosInstance.get<Usuario>('/auth/me');
          set({ usuario: data, cargando: false });
        } catch {
          set({ usuario: null, cargando: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ usuario: state.usuario }),
    }
  )
);