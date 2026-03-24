import { useNavigate } from 'react-router';
import { AuthenticationApi } from '~/generated/apis/AuthenticationApi';
import { useApi } from '~/hooks/useApi';
import { useCommand } from '~/hooks/useCommand';
import { useAuth } from '~/providers/AuthProvider';

export function useLogin() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const api = useApi(AuthenticationApi);

  return useCommand(
    (vars: { username: string; password: string }) =>
      api.login({
        loginRequestModel: { username: vars.username, password: vars.password },
      }),
    {
      onSuccess: (response) => {
        signIn(response);
        void navigate('/');
      },
    }
  );
}
