import { useQuery } from '@tanstack/react-query';
import { ForumsApi } from '~/generated/apis/ForumsApi';
import { useApi } from '~/hooks/useApi';

export function useForums() {
  const api = useApi(ForumsApi);
  return useQuery({
    queryKey: ['forums'],
    queryFn: () => api.listForums({}),
  });
}

export function useForum(slug: string) {
  const api = useApi(ForumsApi);
  return useQuery({
    queryKey: ['forums', slug],
    queryFn: () => api.getForum({ slug }),
    enabled: !!slug,
  });
}
