import type { Pedido } from '../types/pedido.types';
import { Modal } from '../../../shared/ui/Modal';
import { BadgeEstado } from '../../../shared/ui/BadgeEstado';

interface PedidoDetalleModalProps {
  pedido: Pedido | null;
  onClose: () => void;
}

export const PedidoDetalleModal = ({
  pedido,
  onClose,
}: PedidoDetalleModalProps) => {
  if (!pedido) return null;

  return (
    <Modal
      isOpen={Boolean(pedido)}
      onClose={onClose}
      title={`Detalle del Pedido #${pedido.id}`}
    >
      <div className="space-y-4 text-sm">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div>
            <p className="text-xs text-stone-500">Fecha de creación</p>
            <p className="font-medium text-stone-800">
              {new Date(pedido.created_at).toLocaleString('es-AR')}
            </p>
          </div>
          <BadgeEstado estado={pedido.estado} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-stone-50 p-3 rounded-lg border border-stone-200">
          <div>
            <p className="text-xs text-stone-500">Dirección de entrega</p>
            <p className="font-medium text-stone-800">
              {pedido.direccion_entrega}
            </p>
          </div>
          <div>
            <p className="text-xs text-stone-500">Forma de pago</p>
            <p className="font-medium text-stone-800">{pedido.forma_pago}</p>
          </div>
          {pedido.notas && (
            <div className="sm:col-span-2">
              <p className="text-xs text-stone-500">Notas</p>
              <p className="text-stone-700">{pedido.notas}</p>
            </div>
          )}
        </div>

        <div>
          <h4 className="font-semibold text-stone-800 mb-2">Ítems del pedido</h4>
          <div className="divide-y divide-stone-200 border border-stone-200 rounded-lg overflow-hidden">
            {pedido.items.map((linea) => (
              <div
                key={linea.producto_id}
                className="p-3 flex items-center justify-between bg-white"
              >
                <div>
                  <p className="font-medium text-stone-900">
                    {linea.nombre_producto}
                  </p>
                  <p className="text-xs text-stone-500">
                    {linea.cantidad} x $
                    {linea.precio_unitario.toLocaleString('es-AR')}
                  </p>
                </div>
                <span className="font-semibold text-stone-900">
                  ${linea.subtotal.toLocaleString('es-AR')}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-stone-200">
          <span className="text-base font-bold text-stone-800">Total</span>
          <span className="text-lg font-bold text-amber-700">
            ${pedido.total.toLocaleString('es-AR')}
          </span>
        </div>
      </div>
    </Modal>
  );
};