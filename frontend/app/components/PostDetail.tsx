import { Box, Typography } from '@mui/material';
import type { PostResponseModel } from '~/generated/models/PostResponseModel';
import VoteButtons from '~/components/VoteButtons';

interface PostDetailProps {
  post: PostResponseModel;
  isAuthenticated: boolean;
  onVote: (value: number) => void;
}

export default function PostDetail({
  post,
  isAuthenticated,
  onVote,
}: PostDetailProps) {
  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
      <VoteButtons
        upvotes={post.upvotes ?? 0}
        downvotes={post.downvotes ?? 0}
        userVote={post.userVote}
        onVote={onVote}
        disabled={!isAuthenticated}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary">
          r/{post.forumSlug} · {post.author?.username} ·{' '}
          {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}
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
    </Box>
  );
}
