import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Stack, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';
import ContextHeader from '~/components/ContextHeader';
import { useCreatePost } from '~/hooks/api/usePosts';

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
    .min(1, 'Body is required')
    .max(50000, 'Body must not exceed 50000 characters'),
});

type NewPostFormData = z.infer<typeof newPostSchema>;

export function meta() {
  return [{ title: 'New Post - Rideout Forums' }];
}

export default function NewPostForm() {
  const { forumSlug } = useParams();
  const navigate = useNavigate();
  const { mutate, isPending } = useCreatePost();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewPostFormData>({
    resolver: zodResolver(newPostSchema),
  });

  function onSubmit(data: NewPostFormData) {
    mutate(
      {
        forumSlug: forumSlug!,
        slug: data.slug,
        title: data.title,
        body: data.body,
      },
      {
        onSuccess: (post) => {
          void navigate(`/forums/${forumSlug}/posts/${post.slug}`);
        },
      }
    );
  }

  return (
    <>
      <ContextHeader title="Create a Post" />
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
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
              <Button
                variant="outlined"
                onClick={() => void navigate(`/forums/${forumSlug}`)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={isPending}>
                {isPending ? 'Creating...' : 'Create Post'}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Box>
    </>
  );
}
