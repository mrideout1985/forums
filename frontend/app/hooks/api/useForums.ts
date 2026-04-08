import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { ForumsApi } from '~/generated/apis/ForumsApi';
import { useApi } from '~/hooks/useApi';

export function useForums({ size }: { size: number }) {
  const api = useApi(ForumsApi);
  return useInfiniteQuery({
    queryKey: ['forums'],
    queryFn: ({ pageParam }) =>
      api.listForums({
        page: pageParam,
        size,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = lastPage.totalPages ?? 0;
      const nextPage = allPages.length;
      return nextPage < totalPages ? nextPage : undefined;
    },
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
