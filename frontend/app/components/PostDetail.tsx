import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
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
    <Card variant="outlined">
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <VoteButtons
            upvotes={post.upvotes ?? 0}
            downvotes={post.downvotes ?? 0}
            userVote={post.userVote}
            onVote={onVote}
            disabled={!isAuthenticated}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 1 }}
            >
              {post.author?.username && (
                <Typography variant="caption" fontWeight={600}>
                  {post.author.username}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                {post.createdAt
                  ? new Date(post.createdAt).toLocaleDateString()
                  : ''}
              </Typography>
            </Stack>
            <Typography
              component="h1"
              variant="h4"
              fontWeight={600}
              sx={{ overflowWrap: 'anywhere', mb: 2 }}
            >
              {post.title}
            </Typography>
            <Typography
              variant="body1"
              sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
            >
              {post.body}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
