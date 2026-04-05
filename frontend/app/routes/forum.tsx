import { useNavigate, useParams } from 'react-router';
import {
  Alert,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PostCard from '~/components/PostCard';
import { useForum } from '~/hooks/api/useForums';
import { usePostsByForum, useVoteOnPost } from '~/hooks/api/usePosts';
import { useAuth } from '~/providers/AuthProvider';

export function meta() {
  return [{ title: 'Forum - Rideout Forums' }];
}

export default function ForumView() {
  const { forumSlug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: forum, isLoading: forumLoading } = useForum(forumSlug!);
  const {
    data: postsData,
    isLoading: postsLoading,
    error,
  } = usePostsByForum(forumSlug!);
  const { mutate: vote } = useVoteOnPost();

  const posts = postsData?.content ?? [];

  function handleVote(postId: string, value: number) {
    vote({ targetId: postId, value });
  }

  if (forumLoading || postsLoading) {
    return <CircularProgress aria-label="Loading forum" />;
  }

  if (error) {
    return <Alert severity="error">Failed to load forum.</Alert>;
  }

  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <div>
          <Typography component="h1" variant="h4" fontWeight={600}>
            {forum?.name}
          </Typography>
          {forum?.description && (
            <Typography variant="body2" color="text.secondary">
              {forum.description}
            </Typography>
          )}
        </div>
        {isAuthenticated && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => void navigate(`/forums/${forumSlug}/posts/new`)}
          >
            New Post
          </Button>
        )}
      </Stack>
      <Stack spacing={2}>
        {posts.length === 0 ? (
          <Typography color="text.secondary">
            No posts in this forum yet.
          </Typography>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} onVote={handleVote} />
          ))
        )}
      </Stack>
    </>
  );
}
