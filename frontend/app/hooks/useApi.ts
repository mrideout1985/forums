import { useMemo } from 'react';
import { type BaseAPI, type Configuration } from '~/generated/runtime';
import { useAuth } from '~/providers/AuthProvider';
import { createApiConfig } from '~/lib/apiConfig';

type ApiConstructor<T extends BaseAPI> = new (config: Configuration) => T;

export function useApi<T extends BaseAPI>(ApiClass: ApiConstructor<T>): T {
  const { token } = useAuth();
  return useMemo(() => new ApiClass(createApiConfig(token)), [ApiClass, token]);
}
