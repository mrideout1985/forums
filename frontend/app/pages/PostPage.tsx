import {
  Alert,
  Box,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { useParams } from 'react-router';
import CommentCard from '~/components/CommentCard';
import CommentForm from '~/components/CommentForm';
import PostDetail from '~/components/PostDetail';
import type { CommentResponseModel } from '~/generated/models/CommentResponseModel';
import {
  useComments,
  useCreateComment,
  useDeleteComment,
  useVoteOnComment,
} from '~/hooks/api/useComments';
import { usePost, useVoteOnPost } from '~/hooks/api/usePosts';
import { useAuth } from '~/providers/AuthProvider';

export default function PostPage() {
  const { postSlug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const {
    data: post,
    isLoading: postLoading,
    error: postError,
  } = usePost(postSlug!);
  const { data: comments, isLoading: commentsLoading } = useComments(postSlug!);
  const { mutate: votePost } = useVoteOnPost();
  const { mutate: createComment, isPending: commentPending } = useCreateComment(
    postSlug!
  );
  const { mutate: deleteComment } = useDeleteComment(postSlug!);
  const { mutate: voteComment } = useVoteOnComment(postSlug!);

  const isAdmin = user?.roles?.includes('ROLE_ADMIN') ?? false;

  function isCommentOwner(comment: CommentResponseModel) {
    return user?.username === comment.author?.username;
  }

  if (postLoading) {
    return <CircularProgress aria-label="Loading post" />;
  }

  if (postError || !post) {
    return <Alert severity="error">Failed to load post.</Alert>;
  }

  function handlePostVote(value: number) {
    votePost({ targetId: post!.id!, value });
  }

  function handleCommentVote(commentId: number, value: number) {
    voteComment({ commentId, value });
  }

  function handleReply(parentCommentId: number, body: string) {
    createComment({ body, parentCommentId });
  }

  function handleDeleteComment(commentId: number) {
    deleteComment(commentId);
  }

  function handleNewComment(body: string) {
    createComment({ body });
  }

  const commentList = Array.isArray(comments) ? comments : [];

  return (
    <>
      <PostDetail
        post={post}
        isAuthenticated={isAuthenticated}
        onVote={handlePostVote}
      />

      <Divider sx={{ my: 3 }} />

      <Typography component="h2" variant="h6" fontWeight={600} mb={2}>
        Comments ({post.commentCount ?? 0})
      </Typography>

      {isAuthenticated && (
        <Box sx={{ mb: 3 }}>
          <CommentForm onSubmit={handleNewComment} isPending={commentPending} />
        </Box>
      )}

      {commentsLoading ? (
        <CircularProgress aria-label="Loading comments" />
      ) : (
        <Stack spacing={2}>
          {commentList.length === 0 ? (
            <Typography color="text.secondary">No comments yet.</Typography>
          ) : (
            commentList.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                onVote={handleCommentVote}
                onReply={handleReply}
                onDelete={handleDeleteComment}
                isReplyPending={commentPending}
                isAuthenticated={isAuthenticated}
                isOwner={isCommentOwner}
                isAdmin={isAdmin}
              />
            ))
          )}
        </Stack>
      )}
    </>
  );
}
