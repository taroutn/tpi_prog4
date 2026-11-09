import { useMemo, useState, useCallback } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useForm } from '@tanstack/react-form';
import {
  useActualizarCategoria,
  useCategorias,
  useCrearCategoria,
  useEliminarCategoria,
} from '../hooks/useCategorias';
import type { Categoria } from '../types/categoria.types';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Modal } from '../../../shared/ui/Modal';
import { Skeleton } from '../../../shared/components/Skeleton';
import { EstadoError } from '../../../shared/components/EstadoError';
import { handleApiError } from '../../../shared/api/handleApiError';

const columnHelper = createColumnHelper<Categoria>();

export const AdminCategoriasPage = () => {
  const {
    data: categorias = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useCategorias();
  const crearMutation = useCrearCategoria();
  const actualizarMutation = useActualizarCategoria();
  const eliminarMutation = useEliminarCategoria();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(
    null
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [tablaError, setTablaError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      nombre: categoriaEditando?.nombre ?? '',
      descripcion: categoriaEditando?.descripcion ?? '',
    },
    onSubmit: async ({ value }) => {
      setFormError(null);
      try {
        const payload = {
          nombre: value.nombre.trim(),
          descripcion: value.descripcion.trim()
            ? value.descripcion.trim()
            : null,
        };
        if (categoriaEditando) {
          await actualizarMutation.mutateAsync({
            id: categoriaEditando.id,
            payload,
          });
        } else {
          await crearMutation.mutateAsync(payload);
        }
        cerrarModal();
      } catch (err) {
        setFormError(
          handleApiError(err, 'No se pudo guardar la categoría')
        );
      }
    },
  });

  const abrirModalCrear = () => {
    setCategoriaEditando(null);
    setFormError(null);
    form.reset({ nombre: '', descripcion: '' });
    setModalAbierto(true);
  };

  const abrirModalEditar = useCallback((cat: Categoria) => {
    setCategoriaEditando(cat);
    setFormError(null);
    form.reset({
      nombre: cat.nombre,
      descripcion: cat.descripcion ?? '',
    });
    setModalAbierto(true);
  }, [form]);

  const cerrarModal = () => {
    setModalAbierto(false);
    setCategoriaEditando(null);
    setFormError(null);
  };

  const handleEliminar = useCallback(async (cat: Categoria) => {
    setTablaError(null);
    try {
      await eliminarMutation.mutateAsync(cat.id);
    } catch (err) {
      setTablaError(handleApiError(err, 'No se pudo dar de baja la categoría'));
    }
  }, [eliminarMutation]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: (info) => (
          <span className="font-mono text-xs">#{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('nombre', {
        header: 'Nombre',
        cell: (info) => (
          <span className="font-semibold text-stone-900">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('descripcion', {
        header: 'Descripción',
        cell: (info) => (
          <span className="text-stone-600">
            {info.getValue() || 'Sin descripción'}
          </span>
        ),
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => abrirModalEditar(row.original)}
            >
              Editar
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={eliminarMutation.isPending}
              onClick={() => handleEliminar(row.original)}
            >
              Dar de baja
            </Button>
          </div>
        ),
      }),
    ],
    [eliminarMutation.isPending, abrirModalEditar, handleEliminar]
  );

  const table = useReactTable({
    data: categorias,
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
        mensaje={handleApiError(error, 'Error al cargar las categorías')}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            ABM de Categorías
          </h1>
          <p className="text-sm text-stone-500">
            Crea, edita o da de baja lógica las categorías del catálogo
          </p>
        </div>
        <Button variant="primary" onClick={abrirModalCrear}>
          Nueva Categoría
        </Button>
      </div>

      {tablaError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {tablaError}
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
                    colSpan={4}
                    className="px-4 py-8 text-center text-stone-500"
                  >
                    No hay categorías activas registradas.
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

      <Modal
        isOpen={modalAbierto}
        onClose={cerrarModal}
        title={categoriaEditando ? 'Editar Categoría' : 'Nueva Categoría'}
      >
        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {formError}
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
            name="nombre"
            validators={{
              onChange: ({ value }) => {
                const limpio = value.trim();
                if (limpio.length < 2)
                  return 'El nombre debe tener al menos 2 caracteres';
                if (limpio.length > 100)
                  return 'El nombre no puede superar 100 caracteres';
                return undefined;
              },
            }}
          >
            {(field) => (
              <Input
                id="nombre"
                label="Nombre (2 a 100 caracteres)"
                placeholder="Ej. Hamburguesas"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.errors.join(', ')}
              />
            )}
          </form.Field>

          <form.Field name="descripcion">
            {(field) => (
              <Input
                id="descripcion"
                label="Descripción (opcional)"
                placeholder="Descripción breve de la categoría"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={cerrarModal}>
              Cancelar
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar'}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </Modal>
    </div>
  );
};