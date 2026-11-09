import type { EstadoPedido } from '../../features/pedidos/types/pedido.types';

interface BadgeEstadoProps {
  estado: EstadoPedido;
}

export const BadgeEstado = ({ estado }: BadgeEstadoProps) => {
  const estilos: Record<EstadoPedido, string> = {
    PENDIENTE: 'bg-amber-100 text-amber-800 border-amber-300',
    EN_PREPARACION: 'bg-blue-100 text-blue-800 border-blue-300',
    ENTREGADO: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    CANCELADO: 'bg-red-100 text-red-800 border-red-300',
  };

  const etiquetas: Record<EstadoPedido, string> = {
    PENDIENTE: 'Pendiente',
    EN_PREPARACION: 'En preparación',
    ENTREGADO: 'Entregado',
    CANCELADO: 'Cancelado',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${estilos[estado]}`}
    >
      {etiquetas[estado]}
    </span>
  );
};