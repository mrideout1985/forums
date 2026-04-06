import { useDeferredValue } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ForumsApi } from '~/generated/apis/ForumsApi';
import { useApi } from '~/hooks/useApi';

export function useForumSearch(query: string) {
  const api = useApi(ForumsApi);
  const deferredQuery = useDeferredValue(query);

  return useQuery({
    queryKey: ['forums', 'search', deferredQuery],
    queryFn: () => api.listForums({ q: deferredQuery, size: 10 }),
    placeholderData: keepPreviousData,
    enabled: deferredQuery.length >= 1,
  });
}
