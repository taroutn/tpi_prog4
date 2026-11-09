import type { Usuario } from '../../../store/authStore';

export type UsuarioAdmin = Usuario & {
  created_at?: string;
};