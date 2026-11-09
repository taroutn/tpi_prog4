import { useMemo, useState, useCallback } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useCambiarEstadoPedido, usePedidos } from '../hooks/usePedidos';
import type { EstadoPedido, Pedido } from '../types/pedido.types';
import { PedidoDetalleModal } from '../components/PedidoDetalleModal';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { BadgeEstado } from '../../../shared/ui/BadgeEstado';
import { Skeleton } from '../../../shared/components/Skeleton';
import { EstadoError } from '../../../shared/components/EstadoError';
import { handleApiError } from '../../../shared/api/handleApiError';

const columnHelper = createColumnHelper<Pedido>();

export const AdminPedidosPage = () => {
  const [filtroEstado, setFiltroEstado] = useState<EstadoPedido | ''>('');
  const [pedidoDetalle, setPedidoDetalle] = useState<Pedido | null>(null);
  const [accionError, setAccionError] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = usePedidos({
    skip: 0,
    limit: 100,
    estado: filtroEstado,
  });
  const cambiarEstadoMutation = useCambiarEstadoPedido();

  const handleTransicion = useCallback(async (id: number, nuevoEstado: EstadoPedido) => {
    setAccionError(null);
    try {
      await cambiarEstadoMutation.mutateAsync({ id, estado: nuevoEstado });
    } catch (err) {
      setAccionError(handleApiError(err, 'No se pudo cambiar el estado del pedido'));
    }
  }, [cambiarEstadoMutation]);

  const pedidos = data?.items ?? [];

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: (info) => (
          <span className="font-mono text-xs font-bold">
            #{info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('usuario_id', {
        header: 'Usuario',
        cell: (info) => (
          <span className="text-xs text-stone-600">
            Cliente #{info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('created_at', {
        header: 'Fecha',
        cell: (info) => (
          <span className="text-xs text-stone-600">
            {new Date(info.getValue()).toLocaleString('es-AR')}
          </span>
        ),
      }),
      columnHelper.accessor('direccion_entrega', {
        header: 'Entrega / Pago',
        cell: (info) => (
          <div>
            <p className="text-xs font-medium text-stone-800">
              {info.getValue()}
            </p>
            <p className="text-[11px] text-stone-500">
              {info.row.original.forma_pago}
            </p>
          </div>
        ),
      }),
      columnHelper.accessor('total', {
        header: 'Total',
        cell: (info) => (
          <span className="font-bold text-stone-900">
            ${info.getValue().toLocaleString('es-AR')}
          </span>
        ),
      }),
      columnHelper.accessor('estado', {
        header: 'Estado',
        cell: (info) => <BadgeEstado estado={info.getValue()} />,
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones (Máquina de Estados)',
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPedidoDetalle(p)}
              >
                Detalle
              </Button>

              {p.estado === 'PENDIENTE' && (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={cambiarEstadoMutation.isPending}
                    onClick={() => handleTransicion(p.id, 'EN_PREPARACION')}
                  >
                    Preparar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={cambiarEstadoMutation.isPending}
                    onClick={() => handleTransicion(p.id, 'CANCELADO')}
                  >
                    Cancelar
                  </Button>
                </>
              )}

              {p.estado === 'EN_PREPARACION' && (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={cambiarEstadoMutation.isPending}
                    onClick={() => handleTransicion(p.id, 'ENTREGADO')}
                  >
                    Entregar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={cambiarEstadoMutation.isPending}
                    onClick={() => handleTransicion(p.id, 'CANCELADO')}
                  >
                    Cancelar
                  </Button>
                </>
              )}
            </div>
          );
        },
      }),
    ],
    [cambiarEstadoMutation.isPending, handleTransicion]
  );

  const table = useReactTable({
    data: pedidos,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  if (isLoading) return <Skeleton count={5} className="h-16" />;
  if (isError) {
    return (
      <EstadoError
        mensaje={handleApiError(error, 'Error al cargar los pedidos')}
        onRetry={() => refetch()}
      />
    );
  }

  const estadosFiltro: { label: string; valor: EstadoPedido | '' }[] = [
    { label: 'Todos', valor: '' },
    { label: 'Pendientes', valor: 'PENDIENTE' },
    { label: 'En preparación', valor: 'EN_PREPARACION' },
    { label: 'Entregados', valor: 'ENTREGADO' },
    { label: 'Cancelados', valor: 'CANCELADO' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            Gestión de Pedidos
          </h1>
          <p className="text-sm text-stone-500">
            Avanza o cancela pedidos respetando la máquina de estados y
            restitución de stock
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {estadosFiltro.map((f) => (
            <button
              key={f.label}
              onClick={() => setFiltroEstado(f.valor)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                filtroEstado === f.valor
                  ? 'bg-amber-600 text-white'
                  : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {accionError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {accionError}
        </div>
      )}

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-stone-100 border-b border-stone-200 text-xs uppercase text-stone-600">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3 font-semibold">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-stone-200">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-stone-500"
                  >
                    No hay pedidos para el estado seleccionado.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-stone-50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-stone-200 bg-stone-50 text-xs text-stone-600">
          <span>
            Página {table.getState().pagination.pageIndex + 1} de{' '}
            {Math.max(1, table.getPageCount())} ({pedidos.length} pedidos)
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </Card>

      <PedidoDetalleModal
        pedido={pedidoDetalle}
        onClose={() => setPedidoDetalle(null)}
      />
    </div>
  );
};