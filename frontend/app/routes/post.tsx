import { useParams } from 'react-router';
import {
  Alert,
  Box,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import VoteButtons from '~/components/VoteButtons';
import CommentCard from '~/components/CommentCard';
import CommentForm from '~/components/CommentForm';
import { usePost, useVoteOnPost } from '~/hooks/api/usePosts';
import {
  useComments,
  useCreateComment,
  useDeleteComment,
  useVoteOnComment,
} from '~/hooks/api/useComments';
import { useAuth } from '~/providers/AuthProvider';

export function meta() {
  return [{ title: 'Post - Rideout Forums' }];
}

export default function PostView() {
  const { postSlug } = useParams();
  const { isAuthenticated } = useAuth();
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
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <VoteButtons
          upvotes={post.upvotes ?? 0}
          downvotes={post.downvotes ?? 0}
          userVote={post.userVote}
          onVote={handlePostVote}
          disabled={!isAuthenticated}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary">
            r/{post.forumSlug} · {post.author?.username} ·{' '}
            {post.createdAt
              ? new Date(post.createdAt).toLocaleDateString()
              : ''}
          </Typography>
          <Typography
            component="h1"
            variant="h4"
            fontWeight={600}
            sx={{ overflowWrap: 'anywhere' }}
          >
            {post.title}
          </Typography>
          <Typography
            variant="body1"
            sx={{ mt: 2, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
          >
            {post.body}
          </Typography>
        </Box>
      </Stack>

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
              />
            ))
          )}
        </Stack>
      )}
    </>
  );
}
