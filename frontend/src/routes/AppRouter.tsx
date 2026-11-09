import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { MainLayout } from '../shared/layout/MainLayout';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { UnauthorizedPage } from '../features/auth/pages/UnauthorizedPage';
import { CatalogoPage } from '../features/productos/pages/CatalogoPage';
import { CarritoPage } from '../features/pedidos/pages/CarritoPage';
import { CheckoutPage } from '../features/pedidos/pages/CheckoutPage';
import { MisPedidosPage } from '../features/pedidos/pages/MisPedidosPage';
import { AdminResumenPage } from '../features/pedidos/pages/AdminResumenPage';
import { AdminCategoriasPage } from '../features/categorias/pages/AdminCategoriasPage';
import { AdminProductosPage } from '../features/productos/pages/AdminProductosPage';
import { AdminPedidosPage } from '../features/pedidos/pages/AdminPedidosPage';
import { AdminUsuariosPage } from '../features/usuarios/pages/AdminUsuariosPage';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas de Autenticación */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Rutas con MainLayout (Navbar) */}
        <Route element={<MainLayout />}>
          {/* Públicas */}
          <Route path="/" element={<CatalogoPage />} />
          <Route path="/carrito" element={<CarritoPage />} />

          {/* Protegidas (Sesión requerida) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/mis-pedidos" element={<MisPedidosPage />} />
          </Route>

          {/* Protegidas (Solo Admin) */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/resumen" element={<AdminResumenPage />} />
            <Route path="/admin/categorias" element={<AdminCategoriasPage />} />
            <Route path="/admin/productos" element={<AdminProductosPage />} />
            <Route path="/admin/pedidos" element={<AdminPedidosPage />} />
            <Route path="/admin/usuarios" element={<AdminUsuariosPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};