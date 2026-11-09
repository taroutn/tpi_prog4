import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { Link, useNavigate } from 'react-router-dom';
import { loginApi } from '../api/auth.api';
import { useAuthStore } from '../../../store/authStore';
import { handleApiError } from '../../../shared/api/handleApiError';
import { Card } from '../../../shared/ui/Card';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';

export const LoginPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      try {
        const usuario = await loginApi(value);
        login(usuario);
        navigate(usuario.role === 'admin' ? '/admin/resumen' : '/');
      } catch (error) {
        setServerError(handleApiError(error, 'Error al iniciar sesión'));
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 px-4">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-stone-900">Iniciar Sesión</h1>
          <p className="text-sm text-stone-500 mt-1">
            Ingresa a tu cuenta de Food Store
          </p>
        </div>

        {serverError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {serverError}
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
            name="username"
            validators={{
              onChange: ({ value }) =>
                !value.trim() ? 'El usuario es obligatorio' : undefined,
            }}
          >
            {(field) => (
              <Input
                id="username"
                label="Nombre de usuario"
                placeholder="ej. admin"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.errors.join(', ')}
              />
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) =>
                !value ? 'La contraseña es obligatoria' : undefined,
            }}
          >
            {(field) => (
              <Input
                id="password"
                type="password"
                label="Contraseña"
                placeholder="••••••••"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.errors.join(', ')}
              />
            )}
          </form.Field>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                className="w-full mt-2"
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? 'Ingresando...' : 'Ingresar'}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <div className="mt-6 text-center text-sm text-stone-600 space-y-2">
          <p>
            ¿No tienes cuenta?{' '}
            <Link
              to="/register"
              className="text-amber-700 font-semibold hover:underline"
            >
              Regístrate aquí
            </Link>
          </p>
          <p>
            <Link to="/" className="text-xs text-stone-500 hover:underline">
              Volver al catálogo público
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};