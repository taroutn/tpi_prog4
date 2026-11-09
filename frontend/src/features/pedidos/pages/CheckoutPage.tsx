import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../../../store/cartStore';
import { useCrearPedido } from '../hooks/usePedidos';
import type { FormaPago } from '../types/pedido.types';
import { handleApiError } from '../../../shared/api/handleApiError';
import { Card } from '../../../shared/ui/Card';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { EstadoVacio } from '../../../shared/components/EstadoVacio';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, total, vaciar } = useCartStore();
  const crearPedidoMutation = useCrearPedido();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      direccion_entrega: '',
      forma_pago: 'EFECTIVO' as FormaPago,
      notas: '',
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      try {
        await crearPedidoMutation.mutateAsync({
          items: items.map((i) => ({
            producto_id: i.producto_id,
            cantidad: i.cantidad,
          })),
          direccion_entrega: value.direccion_entrega.trim(),
          forma_pago: value.forma_pago,
          notas: value.notas.trim() ? value.notas.trim() : null,
        });
        vaciar();
        navigate('/mis-pedidos');
      } catch (error) {
        setServerError(handleApiError(error, 'No se pudo confirmar el pedido'));
      }
    },
  });

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="No hay productos para confirmar"
        descripcion="Tu carrito está vacío."
        accion={
          <Link to="/">
            <Button variant="primary">Volver al catálogo</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-stone-900">Confirmar Pedido</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="md:col-span-3 space-y-4">
          <h2 className="text-lg font-semibold text-stone-800">
            Datos de Entrega y Pago
          </h2>

          {serverError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {serverError}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-4"
          >
            <form.Field
              name="direccion_entrega"
              validators={{
                onChange: ({ value }) => {
                  const limpio = value.trim();
                  if (limpio.length < 5)
                    return 'La dirección debe tener al menos 5 caracteres';
                  if (limpio.length > 200)
                    return 'La dirección no puede superar 200 caracteres';
                  return undefined;
                },
              }}
            >
              {(field) => (
                <Input
                  id="direccion_entrega"
                  label="Dirección de entrega"
                  placeholder="Ej. Av. Libertad 450, Piso 2"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors.join(', ')}
                />
              )}
            </form.Field>

            <form.Field name="forma_pago">
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="forma_pago"
                    className="text-sm font-medium text-stone-700"
                  >
                    Forma de pago
                  </label>
                  <select
                    id="forma_pago"
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(e.target.value as FormaPago)
                    }
                    className="w-full rounded-lg border border-stone-300 px-3.5 py-2 text-sm text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="EFECTIVO">Efectivo al recibir</option>
                    <option value="TRANSFERENCIA">
                      Transferencia bancaria
                    </option>
                  </select>
                </div>
              )}
            </form.Field>

            <form.Field name="notas">
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="notas"
                    className="text-sm font-medium text-stone-700"
                  >
                    Notas adicionales (opcional)
                  </label>
                  <textarea
                    id="notas"
                    rows={3}
                    placeholder="Indicaciones del timbre, sin aderezos, etc."
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 px-3.5 py-2 text-sm text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}
            </form.Field>

            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting ? 'Procesando pedido...' : 'Confirmar Pedido'}
                </Button>
              )}
            </form.Subscribe>
          </form>
        </Card>

        <Card className="md:col-span-2 bg-stone-100/70 space-y-4 h-fit">
          <h2 className="text-base font-semibold text-stone-800">
            Resumen del Carrito
          </h2>
          <div className="divide-y divide-stone-200 text-sm">
            {items.map((item) => (
              <div
                key={item.producto_id}
                className="py-2.5 flex justify-between gap-2"
              >
                <span className="text-stone-700">
                  {item.cantidad}x {item.nombre}
                </span>
                <span className="font-semibold text-stone-900">
                  ${(item.precio_unitario * item.cantidad).toLocaleString('es-AR')}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-stone-300 pt-3 flex justify-between items-center">
            <span className="font-semibold text-stone-800">Total</span>
            <span className="text-xl font-bold text-amber-700">
              ${total().toLocaleString('es-AR')}
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
};