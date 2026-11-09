import { useState } from 'react';
import { useProductos } from '../hooks/useProductos';
import { useCategorias } from '../../categorias/hooks/useCategorias';
import { ProductoCard } from '../components/ProductoCard';
import { Input } from '../../../shared/ui/Input';
import { Skeleton } from '../../../shared/components/Skeleton';
import { EstadoVacio } from '../../../shared/components/EstadoVacio';
import { EstadoError } from '../../../shared/components/EstadoError';
import { Paginacion } from '../../../shared/components/Paginacion';
import { handleApiError } from '../../../shared/api/handleApiError';

const LIMITE_POR_PAGINA = 6;

export const CatalogoPage = () => {
  const [pagina, setPagina] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);

  const { data: categorias } = useCategorias();
  const {
    data: productosData,
    isLoading,
    isError,
    error,
    refetch,
  } = useProductos({
    skip: pagina * LIMITE_POR_PAGINA,
    limit: LIMITE_POR_PAGINA,
    search: busqueda,
    categoria_id: categoriaId,
  });

  const handleSearchChange = (valor: string) => {
    setBusqueda(valor);
    setPagina(0);
  };

  const handleCategoriaChange = (id?: number) => {
    setCategoriaId(id);
    setPagina(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-5 rounded-xl border border-stone-200">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            Menú de Comidas
          </h1>
          <p className="text-sm text-stone-500">
            Explora nuestras especialidades recién preparadas
          </p>
        </div>

        <div className="w-full md:w-80">
          <Input
            placeholder="Buscar plato por nombre..."
            value={busqueda}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Filtro por categorías */}
      {categorias && categorias.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleCategoriaChange(undefined)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              categoriaId === undefined
                ? 'bg-amber-600 text-white'
                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
            }`}
          >
            Todas
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoriaChange(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                categoriaId === cat.id
                  ? 'bg-amber-600 text-white'
                  : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      )}

      {/* Contenido */}
      {isLoading ? (
        <Skeleton count={6} />
      ) : isError ? (
        <EstadoError
          mensaje={handleApiError(error, 'No se pudo cargar el catálogo')}
          onRetry={() => refetch()}
        />
      ) : !productosData || productosData.items.length === 0 ? (
        <EstadoVacio
          titulo="No se encontraron productos"
          descripcion="Prueba cambiando los términos de búsqueda o seleccionando otra categoría."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productosData.items.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>

          <Paginacion
            paginaActual={pagina}
            totalItems={productosData.total}
            limite={LIMITE_POR_PAGINA}
            onPageChange={setPagina}
          />
        </>
      )}
    </div>
  );
};