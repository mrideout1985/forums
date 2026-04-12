import { Alert, Box, Button, CircularProgress, Stack } from '@mui/material';
import ContextHeader from '~/components/ContextHeader';
import ForumCard from '~/components/ForumCard';
import { useForums } from '~/hooks/api/useForums';
import { useJoinForum, useLeaveForum } from '~/hooks/api/useForumMembership';

export default function ForumsPage() {
  const forums = useForums({ size: 25 });
  const { mutate: join, isPending: isJoining } = useJoinForum();
  const { mutate: leave, isPending: isLeaving } = useLeaveForum();

  function handleJoin(slug: string) {
    join({ slug });
  }

  function handleLeave(slug: string) {
    leave({ slug });
  }

  if (!forums.data && !forums.isError) {
    return <CircularProgress aria-label="Loading forums" />;
  }

  if (forums.isError) {
    return <Alert severity="error">Failed to load forums.</Alert>;
  }

  const items = forums.data?.pages ?? [];
  const hasForums = items.some((page) => (page.content?.length ?? 0) > 0);

  if (!hasForums) {
    return (
      <>
        <ContextHeader title="Explore Forums" />
        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          <Alert severity="info">No forums available.</Alert>
        </Box>
      </>
    );
  }

  return (
    <>
      <ContextHeader title="Explore Forums" />
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        <Stack spacing={2}>
          {items.map((page) =>
            page.content?.map((forum) => (
              <ForumCard
                key={forum.slug}
                forum={forum}
                isJoinPending={isJoining}
                isLeavePending={isLeaving}
                onJoin={handleJoin}
                onLeave={handleLeave}
              />
            ))
          )}
          {!forums.hasNextPage && (
            <Alert severity="info" sx={{ textAlign: 'center' }}>
              No more forums to load.
            </Alert>
          )}
          {forums.hasNextPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                variant="outlined"
                disabled={!forums.hasNextPage || forums.isFetchingNextPage}
                onClick={() => forums.fetchNextPage()}
              >
                {forums.isFetchingNextPage ? 'Loading...' : 'Load more'}
              </Button>
            </Box>
          )}
        </Stack>
      </Box>
    </>
  );
}
