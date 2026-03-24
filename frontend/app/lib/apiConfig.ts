import { Configuration } from '~/generated/runtime';

export function createApiConfig(token?: string | null): Configuration {
  return new Configuration({
    basePath: 'http://localhost:8080',
    ...(token ? { accessToken: token } : {}),
  });
}
