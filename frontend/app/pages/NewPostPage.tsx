import { useNavigate, useParams } from 'react-router';
import { Box } from '@mui/material';
import ContextHeader from '~/components/ContextHeader';
import NewPostForm, { type NewPostFormData } from '~/components/NewPostForm';
import { useCreatePost } from '~/hooks/api/usePosts';

export default function NewPostPage() {
  const { forumSlug } = useParams();
  const navigate = useNavigate();
  const { mutate, isPending } = useCreatePost();

  function handleSubmit(data: NewPostFormData) {
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

  function handleCancel() {
    void navigate(`/forums/${forumSlug}`);
  }

  return (
    <>
      <ContextHeader title="Create a Post" />
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        <NewPostForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isPending={isPending}
        />
      </Box>
    </>
  );
}
