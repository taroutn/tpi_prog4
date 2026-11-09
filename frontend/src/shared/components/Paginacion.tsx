import { Button } from '../ui/Button';

interface PaginacionProps {
  paginaActual: number;
  totalItems: number;
  limite: number;
  onPageChange: (nuevaPagina: number) => void;
}

export const Paginacion = ({
  paginaActual,
  totalItems,
  limite,
  onPageChange,
}: PaginacionProps) => {
  const totalPaginas = Math.max(1, Math.ceil(totalItems / limite));

  if (totalPaginas <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-stone-200 pt-4 mt-6">
      <span className="text-xs text-stone-600">
        Página <span className="font-semibold">{paginaActual + 1}</span> de{' '}
        <span className="font-semibold">{totalPaginas}</span> ({totalItems}{' '}
        registros)
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={paginaActual === 0}
          onClick={() => onPageChange(paginaActual - 1)}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={paginaActual + 1 >= totalPaginas}
          onClick={() => onPageChange(paginaActual + 1)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
};