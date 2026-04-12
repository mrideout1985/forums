import { useNavigate } from 'react-router';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
} from '@mui/material';
import type { ForumResponseModel } from '~/generated/models/ForumResponseModel';

interface ForumCardProps {
  forum: ForumResponseModel;
  isJoinPending: boolean;
  isLeavePending: boolean;
  onJoin: (slug: string) => void;
  onLeave: (slug: string) => void;
}

export default function ForumCard({
  forum,
  isJoinPending,
  isLeavePending,
  onJoin,
  onLeave,
}: ForumCardProps) {
  const navigate = useNavigate();

  return (
    <Card variant="outlined">
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
            disabled={isLeavePending}
            onClick={() => onLeave(forum.slug!)}
          >
            Leave
          </Button>
        ) : (
          <Button
            size="small"
            variant="contained"
            disabled={isJoinPending}
            onClick={() => onJoin(forum.slug!)}
          >
            Join
          </Button>
        )}
      </CardActions>
    </Card>
  );
}
