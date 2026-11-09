import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCancelarPedido, usePedidos } from '../hooks/usePedidos';
import type { Pedido } from '../types/pedido.types';
import { PedidoDetalleModal } from '../components/PedidoDetalleModal';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { BadgeEstado } from '../../../shared/ui/BadgeEstado';
import { Skeleton } from '../../../shared/components/Skeleton';
import { EstadoVacio } from '../../../shared/components/EstadoVacio';
import { EstadoError } from '../../../shared/components/EstadoError';
import { handleApiError } from '../../../shared/api/handleApiError';

export const MisPedidosPage = () => {
  const { data, isLoading, isError, error, refetch } = usePedidos({
    skip: 0,
    limit: 50,
  });
  const cancelarMutation = useCancelarPedido();
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(
    null
  );
  const [accionError, setAccionError] = useState<string | null>(null);

  const handleCancelar = async (pedidoId: number) => {
    setAccionError(null);
    try {
      await cancelarMutation.mutateAsync(pedidoId);
    } catch (err) {
      setAccionError(handleApiError(err, 'No se pudo cancelar el pedido'));
    }
  };

  if (isLoading) {
    return <Skeleton count={3} className="h-36" />;
  }

  if (isError) {
    return (
      <EstadoError
        mensaje={handleApiError(error, 'Error al cargar tus pedidos')}
        onRetry={() => refetch()}
      />
    );
  }

  const pedidos = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Mis Pedidos</h1>
          <p className="text-sm text-stone-500">
            Consulta el estado y detalle de tus compras
          </p>
        </div>
        <Link to="/">
          <Button variant="outline" size="sm">
            Nuevo pedido
          </Button>
        </Link>
      </div>

      {accionError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {accionError}
        </div>
      )}

      {pedidos.length === 0 ? (
        <EstadoVacio
          titulo="Aún no tienes pedidos realizados"
          descripcion="Cuando confirmes tu primer carrito aparecerá aquí."
          accion={
            <Link to="/">
              <Button variant="primary">Explorar catálogo</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {pedidos.map((pedido) => (
            <Card
              key={pedido.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-stone-900">
                    Pedido #{pedido.id}
                  </span>
                  <BadgeEstado estado={pedido.estado} />
                </div>
                <p className="text-xs text-stone-500">
                  Fecha: {new Date(pedido.created_at).toLocaleString('es-AR')} ·
                  Pago: {pedido.forma_pago}
                </p>
                <p className="text-xs text-stone-600">
                  Entrega en: {pedido.direccion_entrega}
                </p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-200">
                <div className="text-left sm:text-right mr-2">
                  <span className="text-xs text-stone-500 block">Total</span>
                  <span className="text-lg font-bold text-stone-900">
                    ${pedido.total.toLocaleString('es-AR')}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPedidoSeleccionado(pedido)}
                >
                  Ver detalle
                </Button>

                {pedido.estado === 'PENDIENTE' && (
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={cancelarMutation.isPending}
                    onClick={() => handleCancelar(pedido.id)}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <PedidoDetalleModal
        pedido={pedidoSeleccionado}
        onClose={() => setPedidoSeleccionado(null)}
      />
    </div>
  );
};