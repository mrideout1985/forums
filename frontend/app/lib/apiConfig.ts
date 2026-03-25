import { Configuration } from '~/generated/runtime';

export function createApiConfig(): Configuration {
  return new Configuration({
    basePath: 'http://localhost:8080',
    credentials: 'include',
  });
}
