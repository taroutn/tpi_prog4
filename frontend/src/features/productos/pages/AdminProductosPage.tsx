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
  useActualizarProducto,
  useActualizarStockProducto,
  useCrearProducto,
  useEliminarProducto,
  useProductos,
} from '../hooks/useProductos';
import { useCategorias } from '../../categorias/hooks/useCategorias';
import type { Producto } from '../types/producto.types';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Modal } from '../../../shared/ui/Modal';
import { Skeleton } from '../../../shared/components/Skeleton';
import { EstadoError } from '../../../shared/components/EstadoError';
import { handleApiError } from '../../../shared/api/handleApiError';

const columnHelper = createColumnHelper<Producto>();

export const AdminProductosPage = () => {
  const {
    data: productosData,
    isLoading,
    isError,
    error,
    refetch,
  } = useProductos({ skip: 0, limit: 100 });
  const { data: categorias = [] } = useCategorias();

  const crearMutation = useCrearProducto();
  const actualizarMutation = useActualizarProducto();
  const stockMutation = useActualizarStockProducto();
  const eliminarMutation = useEliminarProducto();

  const [modalFormAbierto, setModalFormAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState<Producto | null>(
    null
  );
  const [productoStockModal, setProductoStockModal] = useState<Producto | null>(
    null
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [tablaError, setTablaError] = useState<string | null>(null);

  const formProducto = useForm({
    defaultValues: {
      nombre: '',
      descripcion: '',
      precio_base: 0,
      imagen_url: '',
      stock: 0,
      disponible: true,
      categoria_id: categorias[0]?.id ?? 1,
    },
    onSubmit: async ({ value }) => {
      setFormError(null);
      try {
        const payload = {
          nombre: value.nombre.trim(),
          descripcion: value.descripcion.trim()
            ? value.descripcion.trim()
            : null,
          precio_base: Number(value.precio_base),
          imagen_url: value.imagen_url.trim()
            ? value.imagen_url.trim()
            : null,
          stock: Number(value.stock),
          disponible: Boolean(value.disponible),
          categoria_id: Number(value.categoria_id),
        };
        if (productoEditando) {
          await actualizarMutation.mutateAsync({
            id: productoEditando.id,
            payload,
          });
        } else {
          await crearMutation.mutateAsync(payload);
        }
        setModalFormAbierto(false);
        setProductoEditando(null);
      } catch (err) {
        setFormError(handleApiError(err, 'No se pudo guardar el producto'));
      }
    },
  });

  const formStock = useForm({
    defaultValues: {
      stock: 0,
      disponible: true,
    },
    onSubmit: async ({ value }) => {
      if (!productoStockModal) return;
      setFormError(null);
      try {
        await stockMutation.mutateAsync({
          id: productoStockModal.id,
          payload: {
            stock: Number(value.stock),
            disponible: Boolean(value.disponible),
          },
        });
        setProductoStockModal(null);
      } catch (err) {
        setFormError(handleApiError(err, 'No se pudo actualizar el stock'));
      }
    },
  });

  const abrirModalCrear = () => {
    setProductoEditando(null);
    setFormError(null);
    formProducto.reset({
      nombre: '',
      descripcion: '',
      precio_base: 0,
      imagen_url: '',
      stock: 10,
      disponible: true,
      categoria_id: categorias[0]?.id ?? 1,
    });
    setModalFormAbierto(true);
  };

  const abrirModalEditar = useCallback((prod: Producto) => {
    setProductoEditando(prod);
    setFormError(null);
    formProducto.reset({
      nombre: prod.nombre,
      descripcion: prod.descripcion ?? '',
      precio_base: prod.precio_base,
      imagen_url: prod.imagen_url ?? '',
      stock: prod.stock,
      disponible: prod.disponible,
      categoria_id: prod.categoria_id,
    });
    setModalFormAbierto(true);
  }, [formProducto]);

  const abrirModalStock = useCallback((prod: Producto) => {
    setFormError(null);
    setProductoStockModal(prod);
    formStock.reset({
      stock: prod.stock,
      disponible: prod.disponible,
    });
  }, [formStock]);

  const handleEliminar = useCallback(async (prod: Producto) => {
    setTablaError(null);
    try {
      await eliminarMutation.mutateAsync(prod.id);
    } catch (err) {
      setTablaError(handleApiError(err, 'No se pudo dar de baja el producto'));
    }
  }, [eliminarMutation]);

  const productos = productosData?.items ?? [];

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: (info) => (
          <span className="font-mono text-xs">#{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('nombre', {
        header: 'Producto',
        cell: (info) => (
          <div>
            <p className="font-semibold text-stone-900">{info.getValue()}</p>
            <p className="text-xs text-stone-500">
              {info.row.original.categoria?.nombre ??
                `Categoría #${info.row.original.categoria_id}`}
            </p>
          </div>
        ),
      }),
      columnHelper.accessor('precio_base', {
        header: 'Precio',
        cell: (info) => (
          <span className="font-semibold text-stone-900">
            ${info.getValue().toLocaleString('es-AR')}
          </span>
        ),
      }),
      columnHelper.accessor('stock', {
        header: 'Stock',
        cell: (info) => (
          <span
            className={`font-bold ${
              info.getValue() === 0 ? 'text-red-600' : 'text-stone-800'
            }`}
          >
            {info.getValue()} u.
          </span>
        ),
      }),
      columnHelper.accessor('disponible', {
        header: 'Disponibilidad',
        cell: (info) =>
          info.getValue() ? (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Disponible
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-200 text-stone-700">
              No disponible
            </span>
          ),
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => abrirModalStock(row.original)}
            >
              Stock / Disp.
            </Button>
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
              Baja
            </Button>
          </div>
        ),
      }),
    ],
    [eliminarMutation.isPending, abrirModalEditar, abrirModalStock, handleEliminar]
  );

  const table = useReactTable({
    data: productos,
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
        mensaje={handleApiError(error, 'Error al cargar los productos')}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            ABM de Productos y Stock
          </h1>
          <p className="text-sm text-stone-500">
            Administra los platos, precios, disponibilidad y existencias
          </p>
        </div>
        <Button variant="primary" onClick={abrirModalCrear}>
          Nuevo Producto
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
                    colSpan={6}
                    className="px-4 py-8 text-center text-stone-500"
                  >
                    No hay productos activos registrados.
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
            {Math.max(1, table.getPageCount())} ({productos.length} productos)
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

      {/* Modal Crear / Editar Producto */}
      <Modal
        isOpen={modalFormAbierto}
        onClose={() => setModalFormAbierto(false)}
        title={productoEditando ? 'Editar Producto' : 'Nuevo Producto'}
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
            formProducto.handleSubmit();
          }}
          className="space-y-4"
        >
          <formProducto.Field
            name="nombre"
            validators={{
              onChange: ({ value }) =>
                !value.trim() ? 'El nombre es obligatorio' : undefined,
            }}
          >
            {(field) => (
              <Input
                id="nombre"
                label="Nombre del producto"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.errors.join(', ')}
              />
            )}
          </formProducto.Field>

          <formProducto.Field name="categoria_id">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-stone-700">
                  Categoría
                </label>
                <select
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  className="w-full rounded-lg border border-stone-300 px-3.5 py-2 text-sm text-stone-900 bg-white"
                >
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </formProducto.Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <formProducto.Field
              name="precio_base"
              validators={{
                onChange: ({ value }) =>
                  Number(value) < 0 ? 'El precio debe ser >= 0' : undefined,
              }}
            >
              {(field) => (
                <Input
                  id="precio_base"
                  type="number"
                  step="0.01"
                  label="Precio base ($)"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  error={field.state.meta.errors.join(', ')}
                />
              )}
            </formProducto.Field>

            <formProducto.Field
              name="stock"
              validators={{
                onChange: ({ value }) =>
                  Number(value) < 0 ? 'El stock debe ser >= 0' : undefined,
              }}
            >
              {(field) => (
                <Input
                  id="stock"
                  type="number"
                  label="Stock inicial"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  error={field.state.meta.errors.join(', ')}
                />
              )}
            </formProducto.Field>
          </div>

          <formProducto.Field name="imagen_url">
            {(field) => (
              <Input
                id="imagen_url"
                label="URL de imagen (opcional)"
                placeholder="https://..."
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </formProducto.Field>

          <formProducto.Field name="descripcion">
            {(field) => (
              <Input
                id="descripcion"
                label="Descripción (opcional)"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </formProducto.Field>

          <formProducto.Field name="disponible">
            {(field) => (
              <label className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={field.state.value}
                  onChange={(e) => field.handleChange(e.target.checked)}
                  className="rounded border-stone-300"
                />
                Disponible para la venta
              </label>
            )}
          </formProducto.Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalFormAbierto(false)}
            >
              Cancelar
            </Button>
            <formProducto.Subscribe
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
            </formProducto.Subscribe>
          </div>
        </form>
      </Modal>

      {/* Modal Rápido de Stock y Disponibilidad (PATCH /productos/{id}/stock) */}
      <Modal
        isOpen={Boolean(productoStockModal)}
        onClose={() => setProductoStockModal(null)}
        title={`Stock: ${productoStockModal?.nombre ?? ''}`}
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
            formStock.handleSubmit();
          }}
          className="space-y-4"
        >
          <formStock.Field
            name="stock"
            validators={{
              onChange: ({ value }) =>
                Number(value) < 0 ? 'El stock no puede ser negativo' : undefined,
            }}
          >
            {(field) => (
              <Input
                id="patch_stock"
                type="number"
                label="Cantidad en stock (>= 0)"
                value={field.state.value}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                error={field.state.meta.errors.join(', ')}
              />
            )}
          </formStock.Field>

          <formStock.Field name="disponible">
            {(field) => (
              <label className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={field.state.value}
                  onChange={(e) => field.handleChange(e.target.checked)}
                  className="rounded border-stone-300"
                />
                Habilitado como disponible en el catálogo
              </label>
            )}
          </formStock.Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setProductoStockModal(null)}
            >
              Cancelar
            </Button>
            <formStock.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting ? 'Actualizando...' : 'Actualizar Stock'}
                </Button>
              )}
            </formStock.Subscribe>
          </div>
        </form>
      </Modal>
    </div>
  );
};