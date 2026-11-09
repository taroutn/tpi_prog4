import { Button } from '../ui/Button';

interface EstadoErrorProps {
  mensaje: string;
  onRetry?: () => void;
}

export const EstadoError = ({ mensaje, onRetry }: EstadoErrorProps) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4 bg-red-50 border border-red-200 rounded-xl">
      <p className="text-sm font-semibold text-red-800">{mensaje}</p>
      {onRetry && (
        <div className="mt-3">
          <Button variant="danger" size="sm" onClick={onRetry}>
            Reintentar
          </Button>
        </div>
      )}
    </div>
  );
};