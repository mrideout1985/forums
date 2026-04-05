import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { ForumsApi } from '~/generated/apis/ForumsApi';
import { useApi } from '~/hooks/useApi';
import { useCommand } from '~/hooks/useCommand';

const createForumSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must not exceed 100 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100, 'Slug must not exceed 100 characters')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must be lowercase with hyphens only'
    ),
  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
});

type CreateForumFormData = z.infer<typeof createForumSchema>;

interface CreateForumDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateForumDialog({
  open,
  onClose,
}: CreateForumDialogProps) {
  const forumsApi = useApi(ForumsApi);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateForumFormData>({
    resolver: zodResolver(createForumSchema),
  });

  const { mutate, isPending } = useCommand(
    (data: CreateForumFormData) =>
      forumsApi.createForum({
        forumCreateRequestModel: {
          name: data.name,
          slug: data.slug,
          description: data.description,
        },
      }),
    {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ['forums'] });
        reset();
        onClose();
      },
    }
  );

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit((data) => mutate(data))} noValidate>
        <DialogTitle>Create Forum</DialogTitle>
        <DialogContent>
          <TextField
            {...register('name')}
            label="Name"
            fullWidth
            required
            margin="normal"
            error={!!errors.name}
            helperText={errors.name?.message}
            aria-invalid={!!errors.name}
            autoFocus
          />
          <TextField
            {...register('slug')}
            label="Slug"
            fullWidth
            required
            margin="normal"
            error={!!errors.slug}
            helperText={
              errors.slug?.message ?? 'URL-friendly identifier (e.g. my-forum)'
            }
            aria-invalid={!!errors.slug}
          />
          <TextField
            {...register('description')}
            label="Description"
            fullWidth
            multiline
            rows={3}
            margin="normal"
            error={!!errors.description}
            helperText={errors.description?.message}
            aria-invalid={!!errors.description}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
