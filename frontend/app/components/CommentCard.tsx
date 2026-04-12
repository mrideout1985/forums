import { Box, IconButton, Stack, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { CommentResponseModel } from '~/generated/models/CommentResponseModel';
import VoteButtons from '~/components/VoteButtons';
import CommentForm from '~/components/CommentForm';

interface CommentCardProps {
  comment: CommentResponseModel;
  onVote: (commentId: number, value: number) => void;
  onReply: (parentCommentId: number, body: string) => void;
  onDelete: (commentId: number) => void;
  isReplyPending?: boolean;
  isAuthenticated: boolean;
  isOwner: (comment: CommentResponseModel) => boolean;
  isAdmin: boolean;
  depth?: number;
}

export default function CommentCard({
  comment,
  onVote,
  onReply,
  onDelete,
  isReplyPending = false,
  isAuthenticated,
  isOwner,
  isAdmin,
  depth = 0,
}: CommentCardProps) {
  const canDelete = isOwner(comment) || isAdmin;

  return (
    <Box
      sx={{
        ml: depth > 0 ? 3 : 0,
        pl: depth > 0 ? 2 : 0,
        borderLeft: depth > 0 ? 2 : 0,
        borderColor: 'divider',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="flex-start">
        <VoteButtons
          upvotes={comment.upvotes ?? 0}
          downvotes={comment.downvotes ?? 0}
          userVote={comment.userVote}
          onVote={(value) => onVote(comment.id!, value)}
          disabled={!isAuthenticated}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" fontWeight={600}>
              {comment.author?.username}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {comment.createdAt
                ? new Date(comment.createdAt).toLocaleDateString()
                : ''}
            </Typography>
            {canDelete && (
              <IconButton
                size="small"
                onClick={() => onDelete(comment.id!)}
                aria-label={`Delete comment by ${comment.author?.username}`}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>
          <Typography
            variant="body2"
            sx={{ mt: 0.5, overflowWrap: 'anywhere' }}
          >
            {comment.body}
          </Typography>
          {isAuthenticated && (
            <CommentForm
              onSubmit={(body) => onReply(comment.id!, body)}
              isPending={isReplyPending}
              label="Reply"
            />
          )}
          {comment.replies?.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              onVote={onVote}
              onReply={onReply}
              onDelete={onDelete}
              isReplyPending={isReplyPending}
              isAuthenticated={isAuthenticated}
              isOwner={isOwner}
              isAdmin={isAdmin}
              depth={depth + 1}
            />
          ))}
        </Box>
      </Stack>
    </Box>
  );
}
