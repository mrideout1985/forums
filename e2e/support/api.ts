import { Configuration } from '@generated/runtime';
import { AuthenticationApi } from '@generated/apis';

const config = new Configuration({
  basePath: 'http://localhost:8080',
});

export const authApi = new AuthenticationApi(config);

export async function registerUser(
  username: string,
  email: string,
  password: string
) {
  await authApi.register({
    authRequestModel: { username, email, password },
  });
}
