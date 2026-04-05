import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CommentsApi } from '~/generated/apis/CommentsApi';
import { VotesApi } from '~/generated/apis/VotesApi';
import { VoteRequestModelTargetTypeEnum } from '~/generated/models/VoteRequestModel';
import { useApi } from '~/hooks/useApi';
import { useCommand } from '~/hooks/useCommand';

export function useComments(postSlug: string) {
  const api = useApi(CommentsApi);
  return useQuery({
    queryKey: ['comments', postSlug],
    queryFn: () => api.listCommentsByPost({ postSlug }),
    enabled: !!postSlug,
  });
}

export function useCreateComment(postSlug: string) {
  const api = useApi(CommentsApi);
  const queryClient = useQueryClient();
  return useCommand(
    (data: { body: string; parentCommentId?: number }) =>
      api.createComment({
        commentCreateRequestModel: {
          postSlug,
          body: data.body,
          parentCommentId: data.parentCommentId,
        },
      }),
    {
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: ['comments', postSlug],
        });
      },
    }
  );
}

export function useDeleteComment(postSlug: string) {
  const api = useApi(CommentsApi);
  const queryClient = useQueryClient();
  return useCommand((commentId: number) => api.deleteComment({ commentId }), {
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['comments', postSlug] });
    },
  });
}

export function useVoteOnComment(postSlug: string) {
  const votesApi = useApi(VotesApi);
  const queryClient = useQueryClient();
  return useCommand(
    (data: { commentId: number; value: number }) =>
      votesApi.castVote({
        voteRequestModel: {
          targetType: VoteRequestModelTargetTypeEnum.Comment,
          targetId: String(data.commentId),
          value: data.value,
        },
      }),
    {
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: ['comments', postSlug],
        });
      },
    }
  );
}
