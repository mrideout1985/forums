import { IconButton, Stack, Typography } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

interface VoteButtonsProps {
  upvotes: number;
  downvotes: number;
  userVote: number | null | undefined;
  onVote: (value: number) => void;
  disabled?: boolean;
}

export default function VoteButtons({
  upvotes,
  downvotes,
  userVote,
  onVote,
  disabled = false,
}: VoteButtonsProps) {
  const score = upvotes - downvotes;

  function handleUpvote() {
    onVote(userVote === 1 ? 0 : 1);
  }

  function handleDownvote() {
    onVote(userVote === -1 ? 0 : -1);
  }

  return (
    <Stack alignItems="center" spacing={0}>
      <IconButton
        size="small"
        onClick={handleUpvote}
        disabled={disabled}
        color={userVote === 1 ? 'primary' : 'default'}
        aria-label="Upvote"
        aria-pressed={userVote === 1}
      >
        <ArrowUpwardIcon fontSize="small" />
      </IconButton>
      <Typography
        variant="body2"
        fontWeight={600}
        color={
          score > 0
            ? 'primary.main'
            : score < 0
              ? 'error.main'
              : 'text.secondary'
        }
      >
        {score}
      </Typography>
      <IconButton
        size="small"
        onClick={handleDownvote}
        disabled={disabled}
        color={userVote === -1 ? 'error' : 'default'}
        aria-label="Downvote"
        aria-pressed={userVote === -1}
      >
        <ArrowDownwardIcon fontSize="small" />
      </IconButton>
    </Stack>
  );
}
