import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Button, TextField } from '@mui/material';

const commentSchema = z.object({
  body: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(10000, 'Comment must not exceed 10000 characters'),
});

type CommentFormData = z.infer<typeof commentSchema>;

interface CommentFormProps {
  onSubmit: (body: string) => void;
  isPending?: boolean;
  label?: string;
}

export default function CommentForm({
  onSubmit,
  isPending = false,
  label = 'Add a comment',
}: CommentFormProps) {
  const [expanded, setExpanded] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
  });

  function handleFormSubmit(data: CommentFormData) {
    onSubmit(data.body);
    reset();
    setExpanded(false);
  }

  if (!expanded) {
    return (
      <Button variant="text" size="small" onClick={() => setExpanded(true)}>
        {label}
      </Button>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(handleFormSubmit)}
      noValidate
      sx={{ mt: 1 }}
    >
      <TextField
        {...register('body')}
        label={label}
        fullWidth
        multiline
        rows={3}
        error={!!errors.body}
        helperText={errors.body?.message}
        aria-invalid={!!errors.body}
        autoFocus
      />
      <Box sx={{ display: 'flex', gap: 1, mt: 1, justifyContent: 'flex-end' }}>
        <Button
          size="small"
          onClick={() => {
            reset();
            setExpanded(false);
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          size="small"
          disabled={isPending}
        >
          {isPending ? 'Posting...' : 'Post'}
        </Button>
      </Box>
    </Box>
  );
}
