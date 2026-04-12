import { Navigate } from 'react-router';
import Loader from '~/components/loader/Loader';
import RegisterForm from '~/components/RegisterForm';
import { ResponseError } from '~/generated/runtime';
import { useRegister } from '~/hooks/api/useRegister';
import { useAuth } from '~/providers/AuthProvider';
import type { RegisterInput } from '~/validation/authValidation';

export default function RegisterPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { mutate: register, isPending, error } = useRegister();

  if (isAuthenticated) return <Navigate to="/" replace />;

  const errorMessage =
    error instanceof ResponseError
      ? error.response.status === 400
        ? 'Username or email already taken.'
        : 'Something went wrong. Please try again.'
      : error?.message;

  function handleRegister(data: RegisterInput) {
    register(data);
  }

  return (
    <Loader
      ready={!isLoading}
      render={() => (
        <RegisterForm
          isPending={isPending}
          errorMessage={errorMessage}
          onSubmit={handleRegister}
        />
      )}
    />
  );
}
