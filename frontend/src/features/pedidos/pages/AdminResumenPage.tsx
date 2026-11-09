import { Link } from 'react-router-dom';
import { useResumenPedidos } from '../hooks/usePedidos';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { Skeleton } from '../../../shared/components/Skeleton';
import { EstadoError } from '../../../shared/components/EstadoError';
import { handleApiError } from '../../../shared/api/handleApiError';

export const AdminResumenPage = () => {
  const { data, isLoading, isError, error, refetch } = useResumenPedidos();

  if (isLoading) return <Skeleton count={6} className="h-32" />;
  if (isError || !data) {
    return (
      <EstadoError
        mensaje={handleApiError(error, 'No se pudo obtener el resumen del panel')}
        onRetry={() => refetch()}
      />
    );
  }

  const tarjetas = [
    {
      titulo: 'Pedidos Pendientes',
      valor: data.pendientes,
      color: 'text-amber-700 bg-amber-50 border-amber-200',
    },
    {
      titulo: 'En Preparación',
      valor: data.en_preparacion,
      color: 'text-blue-700 bg-blue-50 border-blue-200',
    },
    {
      titulo: 'Pedidos Entregados',
      valor: data.entregados,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      titulo: 'Pedidos Cancelados',
      valor: data.cancelados,
      color: 'text-red-700 bg-red-50 border-red-200',
    },
    {
      titulo: 'Pedidos de Hoy',
      valor: data.pedidos_hoy,
      color: 'text-stone-800 bg-stone-100 border-stone-300',
    },
    {
      titulo: 'Ingresos (Entregados)',
      valor: `$${data.ingresos_entregados.toLocaleString('es-AR')}`,
      color: 'text-amber-900 bg-amber-100/70 border-amber-300',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            Resumen del Negocio
          </h1>
          <p className="text-sm text-stone-500">
            Indicadores generales y estado operativo de Food Store
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/pedidos">
            <Button variant="primary" size="sm">
              Gestionar Pedidos
            </Button>
          </Link>
          <Link to="/admin/productos">
            <Button variant="outline" size="sm">
              Ver Stock
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {tarjetas.map((t) => (
          <Card key={t.titulo} className={`border ${t.color}`}>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
              {t.titulo}
            </p>
            <p className="text-3xl font-bold mt-2">{t.valor}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};