import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Stack, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const newPostSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(200, 'Slug must not exceed 200 characters')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must be lowercase with hyphens only'
    ),
  body: z
    .string()
    .min(10, 'Body must be at least 10 characters')
    .max(50000, 'Body must not exceed 50000 characters'),
});

export type NewPostFormData = z.infer<typeof newPostSchema>;

interface NewPostFormProps {
  onSubmit: (data: NewPostFormData) => void;
  onCancel: () => void;
  isPending: boolean;
}

export default function NewPostForm({
  onSubmit,
  onCancel,
  isPending,
}: NewPostFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<NewPostFormData>({
    resolver: zodResolver(newPostSchema),
  });
  const slugify = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // remove non-word chars
      .replace(/\s+/g, '-') // spaces → hyphens
      .replace(/-+/g, '-');

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      sx={{ maxWidth: 720 }}
    >
      <Stack spacing={2}>
        <TextField
          {...register('title')}
          label="Title"
          fullWidth
          required
          error={!!errors.title}
          helperText={errors.title?.message}
          aria-invalid={!!errors.title}
          onChange={(
            event: React.ChangeEvent<
              HTMLInputElement | HTMLTextAreaElement,
              Element
            >
          ) => {
            setValue('slug', slugify(event.target.value));
          }}
        />
        <TextField
          {...register('slug')}
          label="Slug"
          fullWidth
          required
          error={!!errors.slug}
          helperText={
            errors.slug?.message ?? 'URL-friendly identifier (e.g. my-post)'
          }
          aria-invalid={!!errors.slug}
        />
        <TextField
          {...register('body')}
          label="Body"
          fullWidth
          required
          multiline
          rows={8}
          error={!!errors.body}
          helperText={errors.body?.message}
          aria-invalid={!!errors.body}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? 'Creating...' : 'Create Post'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
