import { useMemo, useState, useCallback } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  useActivarUsuario,
  useDesactivarUsuario,
  useUsuarios,
} from '../hooks/useUsuarios';
import type { UsuarioAdmin } from '../types/usuario.types';
import { useAuthStore } from '../../../store/authStore';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { Skeleton } from '../../../shared/components/Skeleton';
import { EstadoError } from '../../../shared/components/EstadoError';
import { handleApiError } from '../../../shared/api/handleApiError';

const columnHelper = createColumnHelper<UsuarioAdmin>();

export const AdminUsuariosPage = () => {
  const usuarioSesion = useAuthStore((state) => state.usuario);
  const { data: usuarios = [], isLoading, isError, error, refetch } = useUsuarios();
  const activarMutation = useActivarUsuario();
  const desactivarMutation = useDesactivarUsuario();
  const [accionError, setAccionError] = useState<string | null>(null);

  const handleToggleEstado = useCallback(async (u: UsuarioAdmin) => {
    setAccionError(null);
    try {
      if (u.disabled) {
        await activarMutation.mutateAsync(u.id);
      } else {
        await desactivarMutation.mutateAsync(u.id);
      }
    } catch (err) {
      setAccionError(handleApiError(err, 'No se pudo actualizar el estado del usuario'));
    }
  }, [activarMutation, desactivarMutation]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: (info) => <span className="font-mono text-xs">#{info.getValue()}</span>,
      }),
      columnHelper.accessor('username', {
        header: 'Usuario',
        cell: (info) => (
          <span className="font-semibold text-stone-900">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('full_name', {
        header: 'Nombre completo',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: (info) => (
          <span className="text-stone-600">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('role', {
        header: 'Rol',
        cell: (info) => (
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
              info.getValue() === 'admin'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-stone-100 text-stone-700'
            }`}
          >
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('disabled', {
        header: 'Estado',
        cell: (info) =>
          info.getValue() ? (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
              Desactivado
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Activo
            </span>
          ),
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const u = row.original;
          const esMismoAdmin = usuarioSesion?.id === u.id;

          if (esMismoAdmin && !u.disabled) {
            return (
              <span className="text-xs text-stone-400 italic">
                Sesión actual
              </span>
            );
          }

          return (
            <Button
              variant={u.disabled ? 'primary' : 'danger'}
              size="sm"
              disabled={
                activarMutation.isPending || desactivarMutation.isPending
              }
              onClick={() => handleToggleEstado(u)}
            >
              {u.disabled ? 'Activar' : 'Desactivar'}
            </Button>
          );
        },
      }),
    ],
    [usuarioSesion?.id, activarMutation.isPending, desactivarMutation.isPending, handleToggleEstado]
  );

  const table = useReactTable({
    data: usuarios,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  if (isLoading) return <Skeleton count={4} className="h-16" />;
  if (isError) {
    return (
      <EstadoError
        mensaje={handleApiError(error, 'Error al cargar los usuarios')}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">
          Gestión de Usuarios
        </h1>
        <p className="text-sm text-stone-500">
          Administra el acceso de las cuentas registradas en el sistema
        </p>
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
              {table.getRowModel().rows.map((row) => (
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
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-stone-200 bg-stone-50 text-xs text-stone-600">
          <span>
            Página {table.getState().pagination.pageIndex + 1} de{' '}
            {Math.max(1, table.getPageCount())}
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
    </div>
  );
};