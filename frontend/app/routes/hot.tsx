import { Alert, Box, Stack } from '@mui/material';
import ContextHeader from '~/components/ContextHeader';
import PostCard from '~/components/PostCard';
import { useHotPosts, useVoteOnPost } from '~/hooks/api/usePosts';
import Loader from '~/components/loader/Loader';

export function meta() {
  return [{ title: 'Hot Posts - Rideout Forums' }];
}

export default function HotFeed() {
  const hotPosts = useHotPosts();
  const { mutate: vote } = useVoteOnPost();

  function handleVote(postId: string, value: number) {
    vote({ targetId: postId, value });
  }

  return (
    <Loader
      ready={Boolean(hotPosts.data) || Boolean(hotPosts.isError)}
      render={() => {
        if (hotPosts.isError) {
          return <Alert severity="error">Failed to load posts.</Alert>;
        }

        if (!hotPosts.data?.content?.length) {
          return <Alert severity="info">No hot posts found.</Alert>;
        }

        return (
          <>
            <ContextHeader title="Hot Posts" />
            <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
              <Stack spacing={2}>
                {hotPosts.data.content.map((post) => (
                  <PostCard key={post.id} post={post} onVote={handleVote} />
                ))}
              </Stack>
            </Box>
          </>
        );
      }}
    />
  );
}
