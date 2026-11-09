import type { ReactNode } from 'react';

interface EstadoVacioProps {
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
}

export const EstadoVacio = ({ titulo, descripcion, accion }: EstadoVacioProps) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4 bg-white border border-dashed border-stone-300 rounded-xl">
      <p className="text-lg font-semibold text-stone-800">{titulo}</p>
      {descripcion && (
        <p className="text-sm text-stone-500 mt-1 max-w-md">{descripcion}</p>
      )}
      {accion && <div className="mt-4">{accion}</div>}
    </div>
  );
};