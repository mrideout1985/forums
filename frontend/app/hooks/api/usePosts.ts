import { useQuery } from '@tanstack/react-query';
import { PostsApi } from '~/generated/apis/PostsApi';
import { useApi } from '~/hooks/useApi';
import { useCommand } from '~/hooks/useCommand';
import { VotesApi } from '~/generated/apis/VotesApi';
import { VoteRequestModelTargetTypeEnum } from '~/generated/models/VoteRequestModel';
import { useQueryClient } from '@tanstack/react-query';

export function usePostsByForum(forumSlug: string) {
  const api = useApi(PostsApi);
  return useQuery({
    queryKey: ['posts', 'forum', forumSlug],
    queryFn: () => api.listPostsByForum({ forumSlug }),
    enabled: !!forumSlug,
  });
}

export function usePost(slug: string) {
  const api = useApi(PostsApi);
  return useQuery({
    queryKey: ['posts', slug],
    queryFn: () => api.getPost({ slug }),
    enabled: !!slug,
  });
}

export function useHotPosts() {
  const api = useApi(PostsApi);
  return useQuery({
    queryKey: ['posts', 'hot'],
    queryFn: () => api.listHotPosts({}),
  });
}

export function useCreatePost() {
  const api = useApi(PostsApi);
  const queryClient = useQueryClient();
  return useCommand(
    (data: { forumSlug: string; slug: string; title: string; body: string }) =>
      api.createPost({
        postCreateRequestModel: {
          forumSlug: data.forumSlug,
          slug: data.slug,
          title: data.title,
          body: data.body,
        },
      }),
    {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ['posts'] });
      },
    }
  );
}

export function useVoteOnPost() {
  const votesApi = useApi(VotesApi);
  const queryClient = useQueryClient();
  return useCommand(
    (data: { targetId: string; value: number }) =>
      votesApi.castVote({
        voteRequestModel: {
          targetType: VoteRequestModelTargetTypeEnum.Post,
          targetId: data.targetId,
          value: data.value,
        },
      }),
    {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ['posts'] });
      },
    }
  );
}
