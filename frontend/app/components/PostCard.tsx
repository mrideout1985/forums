import { useNavigate } from 'react-router';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Typography,
} from '@mui/material';
import CommentIcon from '@mui/icons-material/ChatBubbleOutline';
import type { PostResponseModel } from '~/generated/models/PostResponseModel';
import VoteButtons from '~/components/VoteButtons';
import { useAuth } from '~/providers/AuthProvider';

interface PostCardProps {
  post: PostResponseModel;
  onVote: (postId: string, value: number) => void;
}

export default function PostCard({ post, onVote }: PostCardProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <Card variant="outlined">
      <Box sx={{ display: 'flex' }}>
        <Box sx={{ p: 1, display: 'flex', alignItems: 'flex-start' }}>
          <VoteButtons
            upvotes={post.upvotes ?? 0}
            downvotes={post.downvotes ?? 0}
            userVote={post.userVote}
            onVote={(value) => onVote(post.id!, value)}
            disabled={!isAuthenticated}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <CardActionArea
            onClick={() =>
              void navigate(`/forums/${post.forumSlug}/posts/${post.slug}`)
            }
          >
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                {post.forumSlug && `r/${post.forumSlug} · `}
                {post.author?.username} ·{' '}
                {post.createdAt
                  ? new Date(post.createdAt).toLocaleDateString()
                  : ''}
              </Typography>
              <Typography
                variant="h6"
                component="h2"
                gutterBottom
                sx={{ overflowWrap: 'anywhere' }}
              >
                {post.title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  overflowWrap: 'anywhere',
                }}
              >
                {post.body}
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mt: 1 }}
              >
                <CommentIcon
                  fontSize="small"
                  color="action"
                  aria-hidden="true"
                />
                <Typography variant="caption" color="text.secondary">
                  {post.commentCount ?? 0} comments
                </Typography>
              </Stack>
            </CardContent>
          </CardActionArea>
        </Box>
      </Box>
    </Card>
  );
}
