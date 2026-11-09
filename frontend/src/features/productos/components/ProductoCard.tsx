import type { Producto } from '../types/producto.types';
import { useCartStore } from '../../../store/cartStore';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';

interface ProductoCardProps {
  producto: Producto;
}

export const ProductoCard = ({ producto }: ProductoCardProps) => {
  const agregar = useCartStore((state) => state.agregar);
  const sinStock = !producto.disponible || producto.stock <= 0;

  const handleAgregar = () => {
    agregar({
      producto_id: producto.id,
      nombre: producto.nombre,
      precio_unitario: producto.precio_base,
      cantidad: 1,
    });
  };

  return (
    <Card className="flex flex-col justify-between p-0 overflow-hidden h-full">
      <div>
        <div className="h-44 w-full bg-stone-100 overflow-hidden relative">
          {producto.imagen_url ? (
            <img
              src={producto.imagen_url}
              alt={producto.nombre}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
              Sin imagen
            </div>
          )}
          {producto.categoria && (
            <span className="absolute top-3 left-3 bg-stone-900/80 text-white text-[11px] font-medium px-2.5 py-1 rounded-full">
              {producto.categoria.nombre}
            </span>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-stone-900 text-base">
            {producto.nombre}
          </h3>
          {producto.descripcion && (
            <p className="text-xs text-stone-500 mt-1 line-clamp-2">
              {producto.descripcion}
            </p>
          )}
        </div>
      </div>

      <div className="px-4 pb-4 pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
        <div>
          <span className="text-lg font-bold text-stone-900">
            ${producto.precio_base.toLocaleString('es-AR')}
          </span>
          <p className="text-[11px] text-stone-500">
            {sinStock ? 'Sin stock disponible' : `Stock: ${producto.stock}`}
          </p>
        </div>

        <Button
          variant={sinStock ? 'outline' : 'primary'}
          size="sm"
          disabled={sinStock}
          onClick={handleAgregar}
        >
          {sinStock ? 'Agotado' : 'Agregar al carrito'}
        </Button>
      </div>
    </Card>
  );
};