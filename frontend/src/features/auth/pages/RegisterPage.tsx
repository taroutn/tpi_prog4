import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { Link, useNavigate } from 'react-router-dom';
import { registerApi } from '../api/auth.api';
import { handleApiError } from '../../../shared/api/handleApiError';
import { Card } from '../../../shared/ui/Card';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      username: '',
      full_name: '',
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      try {
        await registerApi(value);
        navigate('/login');
      } catch (error) {
        setServerError(handleApiError(error, 'Error al registrar el usuario'));
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 px-4 py-8">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-stone-900">Crear Cuenta</h1>
          <p className="text-sm text-stone-500 mt-1">
            Regístrate para realizar tus pedidos en Food Store
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
                value.trim().length < 3
                  ? 'El usuario debe tener al menos 3 caracteres'
                  : undefined,
            }}
          >
            {(field) => (
              <Input
                id="username"
                label="Nombre de usuario"
                placeholder="juanperez"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.errors.join(', ')}
              />
            )}
          </form.Field>

          <form.Field
            name="full_name"
            validators={{
              onChange: ({ value }) =>
                value.trim().length < 2
                  ? 'Ingresa tu nombre completo'
                  : undefined,
            }}
          >
            {(field) => (
              <Input
                id="full_name"
                label="Nombre completo"
                placeholder="Pedro Salazar"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.errors.join(', ')}
              />
            )}
          </form.Field>

          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) =>
                !value.includes('@') ? 'Ingresa un email válido' : undefined,
            }}
          >
            {(field) => (
              <Input
                id="email"
                type="email"
                label="Correo electrónico"
                placeholder="juan@correo.com"
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
                value.length < 8
                  ? 'La contraseña debe tener al menos 8 caracteres'
                  : undefined,
            }}
          >
            {(field) => (
              <Input
                id="password"
                type="password"
                label="Contraseña (mínimo 8 caracteres)"
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
                {isSubmitting ? 'Registrando...' : 'Crear cuenta'}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <div className="mt-6 text-center text-sm text-stone-600">
          ¿Ya tienes cuenta?{' '}
          <Link
            to="/login"
            className="text-amber-700 font-semibold hover:underline"
          >
            Inicia sesión
          </Link>
        </div>
      </Card>
    </div>
  );
};