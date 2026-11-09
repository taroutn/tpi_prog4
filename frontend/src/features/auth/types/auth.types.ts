import type { Usuario } from '../../../store/authStore';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  full_name: string;
  email: string;
  password: string;
}

export interface AuthMessage {
  message: string;
}

export type UserPublic = Usuario;