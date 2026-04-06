import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Stack,
  Typography,
} from '@mui/material';
import ContextHeader from '~/components/ContextHeader';
import { useForums } from '~/hooks/api/useForums';
import { useJoinForum, useLeaveForum } from '~/hooks/api/useForumMembership';
import Loader from '~/components/loader/Loader';
import { useNavigate } from 'react-router';

export function meta() {
  return [{ title: 'Explore Forums - Rideout Forums' }];
}

export default function ForumsExplore() {
  const forums = useForums();
  const navigate = useNavigate();
  const { mutate: join, isPending: isJoining } = useJoinForum();
  const { mutate: leave, isPending: isLeaving } = useLeaveForum();

  return (
    <>
      <ContextHeader title="Explore Forums" />
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        <Loader
          ready={Boolean(forums.data) || Boolean(forums.isError)}
          render={() => {
            if (forums.isError) {
              return <Alert severity="error">Failed to load forums.</Alert>;
            }

            const items = forums.data?.content ?? [];

            if (items.length === 0) {
              return <Alert severity="info">No forums available.</Alert>;
            }

            return (
              <Stack spacing={2}>
                {items.map((forum) => (
                  <Card key={forum.slug} variant="outlined">
                    <CardContent
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/forums/${forum.slug}`)}
                    >
                      <Typography variant="h6" component="h2">
                        {forum.name}
                      </Typography>
                      {forum.description && (
                        <Typography variant="body2" color="text.secondary">
                          {forum.description}
                        </Typography>
                      )}
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 1, display: 'block' }}
                      >
                        {forum.memberCount ?? 0}{' '}
                        {forum.memberCount === 1 ? 'member' : 'members'}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      {forum.joined ? (
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={isLeaving}
                          onClick={() => leave({ slug: forum.slug! })}
                        >
                          Leave
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          variant="contained"
                          disabled={isJoining}
                          onClick={() => join({ slug: forum.slug! })}
                        >
                          Join
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                ))}
              </Stack>
            );
          }}
        />
      </Box>
    </>
  );
}
