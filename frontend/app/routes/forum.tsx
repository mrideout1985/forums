import { useNavigate, useParams } from 'react-router';
import { Alert, Box, Button, CircularProgress, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ContextHeader from '~/components/ContextHeader';
import PostCard from '~/components/PostCard';
import { useForum } from '~/hooks/api/useForums';
import { useJoinForum, useLeaveForum } from '~/hooks/api/useForumMembership';
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
  const { mutate: join, isPending: isJoining } = useJoinForum();
  const { mutate: leave, isPending: isLeaving } = useLeaveForum();

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
      <ContextHeader
        title={forum?.name ?? ''}
        description={forum?.description}
        action={
          isAuthenticated ? (
            <Stack direction="row" spacing={1}>
              {forum?.joined ? (
                <Button
                  variant="outlined"
                  disabled={isLeaving}
                  onClick={() => leave({ slug: forumSlug! })}
                >
                  Leave
                </Button>
              ) : (
                <Button
                  variant="contained"
                  disabled={isJoining}
                  onClick={() => join({ slug: forumSlug! })}
                >
                  Join
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate(`/forums/${forumSlug}/posts/new`)}
              >
                New Post
              </Button>
            </Stack>
          ) : undefined
        }
      />
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        <Stack spacing={2}>
          {posts.length === 0 ? (
            <Alert severity="info">No posts in this forum yet.</Alert>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} onVote={handleVote} />
            ))
          )}
        </Stack>
      </Box>
    </>
  );
}
