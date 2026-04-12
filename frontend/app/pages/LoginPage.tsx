import { Navigate } from 'react-router';
import Loader from '~/components/loader/Loader';
import LoginForm from '~/components/LoginForm';
import { ResponseError } from '~/generated/runtime';
import { useLogin } from '~/hooks/api/useLogin';
import { useAuth } from '~/providers/AuthProvider';
import type { LoginInput } from '~/validation/authValidation';

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { mutate: login, isPending, error } = useLogin();

  if (isAuthenticated) return <Navigate to="/" replace />;

  const errorMessage =
    error instanceof ResponseError
      ? error.response.status === 401
        ? 'Invalid username or password.'
        : 'Something went wrong. Please try again.'
      : error?.message;

  function handleLogin(data: LoginInput) {
    login(data);
  }

  return (
    <Loader
      ready={!isLoading}
      render={() => (
        <LoginForm
          isPending={isPending}
          errorMessage={errorMessage}
          onSubmit={handleLogin}
        />
      )}
    />
  );
}
