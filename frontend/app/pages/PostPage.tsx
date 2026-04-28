import {
  Alert,
  Box,
  CircularProgress,
  Link as MuiLink,
  Stack,
  Typography,
} from '@mui/material';
import { Link, useParams } from 'react-router';
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
  const { forumSlug, postSlug } = useParams();
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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          p: { xs: 2, sm: 3 },
          pb: 0,
        }}
      >
        <Box sx={{ maxWidth: 800 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 2, display: 'block' }}
          >
            <MuiLink
              component={Link}
              to={`/forums/${forumSlug ?? post.forumSlug}`}
              color="inherit"
              underline="hover"
            >
              r/{forumSlug ?? post.forumSlug}
            </MuiLink>
          </Typography>

          <PostDetail
            post={post}
            isAuthenticated={isAuthenticated}
            onVote={handlePostVote}
          />
        </Box>
      </Box>

      <Box
        sx={{
          flexShrink: 0,
          px: { xs: 2, sm: 3 },
          pt: 3,
          pb: 2,
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Box sx={{ maxWidth: 800 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography component="h2" variant="h6" fontWeight={600}>
              Comments ({post.commentCount ?? 0})
            </Typography>
          </Stack>

          {isAuthenticated && (
            <Box sx={{ mt: 2 }}>
              <CommentForm
                onSubmit={handleNewComment}
                isPending={commentPending}
              />
            </Box>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          px: { xs: 2, sm: 3 },
          pb: { xs: 2, sm: 3 },
        }}
      >
        <Box sx={{ maxWidth: 800 }}>
          {commentsLoading ? (
            <CircularProgress aria-label="Loading comments" />
          ) : (
            <Stack spacing={2} sx={{ pb: 4 }}>
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
        </Box>
      </Box>
    </Box>
  );
}
