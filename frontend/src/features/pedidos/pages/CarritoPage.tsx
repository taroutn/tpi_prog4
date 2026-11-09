import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../../../store/cartStore';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { EstadoVacio } from '../../../shared/components/EstadoVacio';

export const CarritoPage = () => {
  const navigate = useNavigate();
  const { items, quitar, cambiarCantidad, vaciar, total } = useCartStore();

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="Tu carrito está vacío"
        descripcion="Agrega platos desde el catálogo para armar tu pedido."
        accion={
          <Link to="/">
            <Button variant="primary">Ir al catálogo</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900">Tu Carrito</h1>
        <Button variant="outline" size="sm" onClick={vaciar}>
          Vaciar carrito
        </Button>
      </div>

      <Card className="divide-y divide-stone-200 p-0 overflow-hidden">
        {items.map((item) => (
          <div
            key={item.producto_id}
            className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <h3 className="font-semibold text-stone-900">{item.nombre}</h3>
              <p className="text-xs text-stone-500">
                Precio unitario: ${item.precio_unitario.toLocaleString('es-AR')}
              </p>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4">
              <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    cambiarCantidad(item.producto_id, item.cantidad - 1)
                  }
                  disabled={item.cantidad <= 1}
                  className="px-3 py-1 bg-stone-100 hover:bg-stone-200 disabled:opacity-40 text-sm font-bold cursor-pointer"
                >
                  -
                </button>
                <span className="px-3 py-1 text-sm font-semibold">
                  {item.cantidad}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    cambiarCantidad(item.producto_id, item.cantidad + 1)
                  }
                  className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-sm font-bold cursor-pointer"
                >
                  +
                </button>
              </div>

              <div className="w-24 text-right font-bold text-stone-900">
                ${(item.precio_unitario * item.cantidad).toLocaleString('es-AR')}
              </div>

              <Button
                variant="danger"
                size="sm"
                onClick={() => quitar(item.producto_id)}
              >
                Quitar
              </Button>
            </div>
          </div>
        ))}
      </Card>

      <Card className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-stone-100">
        <div>
          <span className="text-sm text-stone-600">Total a pagar:</span>
          <p className="text-2xl font-bold text-stone-900">
            ${total().toLocaleString('es-AR')}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">
              Seguir comprando
            </Button>
          </Link>
          <Button
            variant="primary"
            className="w-full sm:w-auto"
            onClick={() => navigate('/checkout')}
          >
            Continuar al Checkout
          </Button>
        </div>
      </Card>
    </div>
  );
};