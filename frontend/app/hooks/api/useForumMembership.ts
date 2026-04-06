import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ForumMembershipApi } from '~/generated/apis/ForumMembershipApi';
import { useApi } from '~/hooks/useApi';
import { useCommand } from '~/hooks/useCommand';

export function useJoinedForums() {
  const api = useApi(ForumMembershipApi);
  return useQuery({
    queryKey: ['forums', 'joined'],
    queryFn: () => api.listJoinedForums({}),
  });
}

export function useJoinForum() {
  const api = useApi(ForumMembershipApi);
  const queryClient = useQueryClient();
  return useCommand(
    (data: { slug: string }) => api.joinForum({ slug: data.slug }),
    {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ['forums'] });
      },
    }
  );
}

export function useLeaveForum() {
  const api = useApi(ForumMembershipApi);
  const queryClient = useQueryClient();
  return useCommand(
    (data: { slug: string }) => api.leaveForum({ slug: data.slug }),
    {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ['forums'] });
      },
    }
  );
}
