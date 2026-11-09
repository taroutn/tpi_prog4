import { Link } from 'react-router-dom';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';

export const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 px-4">
      <Card className="max-w-md w-full text-center p-8">
        <h1 className="text-2xl font-bold text-stone-900">Acceso Denegado</h1>
        <p className="text-sm text-stone-600 mt-2">
          No tienes los permisos necesarios para acceder a esta sección.
        </p>
        <div className="mt-6">
          <Link to="/">
            <Button variant="primary">Volver al inicio</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};