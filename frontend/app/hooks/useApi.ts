import { useMemo } from 'react';
import { type BaseAPI, type Configuration } from '~/generated/runtime';
import { createApiConfig } from '~/lib/apiConfig';

type ApiConstructor<T extends BaseAPI> = new (config: Configuration) => T;

export function useApi<T extends BaseAPI>(ApiClass: ApiConstructor<T>): T {
  return useMemo(() => new ApiClass(createApiConfig()), [ApiClass]);
}
