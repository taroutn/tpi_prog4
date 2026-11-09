import { axiosInstance } from '../../../shared/api/axiosInstance';
import type {
  AuthMessage,
  LoginCredentials,
  RegisterPayload,
  UserPublic,
} from '../types/auth.types';

export const loginApi = async (
  credentials: LoginCredentials
): Promise<UserPublic> => {
  const formData = new URLSearchParams();
  formData.append('username', credentials.username);
  formData.append('password', credentials.password);

  await axiosInstance.post<AuthMessage>('/auth/token', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  const { data } = await axiosInstance.get<UserPublic>('/auth/me');
  return data;
};

export const registerApi = async (
  payload: RegisterPayload
): Promise<UserPublic> => {
  const { data } = await axiosInstance.post<UserPublic>(
    '/auth/register',
    payload
  );
  return data;
};