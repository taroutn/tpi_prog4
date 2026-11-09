import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface Props {
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ allowedRoles }: Props) => {
  const { usuario, cargando } = useAuthStore();

  if (cargando) {
    return <div className="flex h-screen items-center justify-center">Cargando sesión...</div>;
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(usuario.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};