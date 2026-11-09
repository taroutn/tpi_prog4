import { Link, NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { Button } from '../ui/Button';

export const Navbar = () => {
  const { usuario, logout } = useAuthStore();
  const itemsCarrito = useCartStore((state) => state.items);
  const cantidadTotal = itemsCarrito.reduce((acc, item) => acc + item.cantidad, 0);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-amber-700 font-semibold' : 'text-stone-600 hover:text-stone-900'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-stone-50/95 backdrop-blur-xs border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold tracking-tight text-stone-900">
            Food<span className="text-amber-600">Store</span>
          </Link>

          <nav className="hidden md:flex items-center gap-5">
            <NavLink to="/" end className={linkClass}>
              Catálogo
            </NavLink>
            {usuario && (
              <NavLink to="/mis-pedidos" className={linkClass}>
                Mis pedidos
              </NavLink>
            )}
            {usuario?.role === 'admin' && (
              <>
                <span className="text-stone-300">|</span>
                <NavLink to="/admin/resumen" className={linkClass}>
                  Resumen
                </NavLink>
                <NavLink to="/admin/categorias" className={linkClass}>
                  Categorías
                </NavLink>
                <NavLink to="/admin/productos" className={linkClass}>
                  Productos
                </NavLink>
                <NavLink to="/admin/pedidos" className={linkClass}>
                  Pedidos
                </NavLink>
                <NavLink to="/admin/usuarios" className={linkClass}>
                  Usuarios
                </NavLink>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/carrito"
            className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-sm font-medium text-stone-800 hover:bg-stone-100"
          >
            <span>Carrito</span>
            {cantidadTotal > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold bg-amber-600 text-white rounded-full">
                {cantidadTotal}
              </span>
            )}
          </Link>

          {usuario ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-stone-800">
                  {usuario.full_name}
                </span>
                <span className="text-[11px] uppercase tracking-wider text-amber-700 font-bold">
                  {usuario.role}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={() => logout()}>
                Cerrar sesión
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Ingresar
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Registrarse
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};