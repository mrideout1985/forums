import { useNavigate } from 'react-router';
import { AuthenticationApi } from '~/generated/apis/AuthenticationApi';
import { useApi } from '~/hooks/useApi';
import { useCommand } from '~/hooks/useCommand';
import { useAuth } from '~/providers/AuthProvider';

export function useRegister() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const api = useApi(AuthenticationApi);

  return useCommand(
    (vars: {
      username: string;
      email: string;
      password: string;
      confirmPassword: string;
    }) =>
      api.register({
        authRequestModel: {
          username: vars.username,
          email: vars.email,
          password: vars.password,
          confirmPassword: vars.confirmPassword,
        },
      }),
    {
      onSuccess: (response) => {
        signIn(response);
        void navigate('/');
      },
    }
  );
}
