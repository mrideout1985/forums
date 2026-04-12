import { Alert, Box, CircularProgress, Stack } from '@mui/material';
import ContextHeader from '~/components/ContextHeader';
import PostCard from '~/components/PostCard';
import { useHotPosts, useVoteOnPost } from '~/hooks/api/usePosts';
import { useAuth } from '~/providers/AuthProvider';

export default function HotPage() {
  const { isAuthenticated } = useAuth();
  const hotPosts = useHotPosts();
  const { mutate: vote } = useVoteOnPost();

  function handleVote(postId: string, value: number) {
    vote({ targetId: postId, value });
  }

  if (!hotPosts.data && !hotPosts.isError) {
    return <CircularProgress aria-label="Loading posts" />;
  }

  if (hotPosts.isError) {
    return <Alert severity="error">Failed to load posts.</Alert>;
  }

  if (!hotPosts.data?.content?.length) {
    return (
      <>
        <ContextHeader title="Hot Posts" />
        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          <Alert severity="info">No hot posts found.</Alert>
        </Box>
      </>
    );
  }

  return (
    <>
      <ContextHeader title="Hot Posts" />
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        <Stack spacing={2}>
          {hotPosts.data.content.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onVote={handleVote}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </Stack>
      </Box>
    </>
  );
}
