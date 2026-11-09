import axios from 'axios';

export const handleApiError = (error: unknown, defaultMessage: string = 'Ocurrió un error inesperado'): string => {
  if (axios.isAxiosError(error) && error.response?.data?.detail) {
    const detail = error.response.data.detail;
    return typeof detail === 'string' ? detail : JSON.stringify(detail);
  }
  if (error instanceof Error) {
    return error.message;
  }
  return defaultMessage;
};