import AddIcon from '@mui/icons-material/Add';
import { Box, Button, List, ListItemButton, ListItemText } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import CreateForumDialog from '~/components/CreateForumDialog';
import { ForumsApi } from '~/generated/apis/ForumsApi';
import { useApi } from '~/hooks/useApi';
import { useAuth } from '~/providers/AuthProvider';

export default function ForumSidebar() {
  const [createForumOpen, setCreateForumOpen] = useState(false);
  const forumsApi = useApi(ForumsApi);
  const navigate = useNavigate();
  const { forumSlug } = useParams();
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  const { data } = useQuery({
    queryKey: ['forums'],
    queryFn: () => forumsApi.listForums({}),
  });

  const forums = data?.content ?? [];

  return (
    <Box
      component="nav"
      aria-label="Forums"
      sx={{
        width: 240,
        flexShrink: 0,
        borderRight: 1,
        borderColor: 'divider',
        overflow: 'auto',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {isAdmin && (
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setCreateForumOpen(true)}
            aria-label="Create forum"
          >
            New
          </Button>
        )}
      </Box>
      <List>
        {forums.map((forum) => (
          <ListItemButton
            key={forum.slug}
            selected={forum.slug === forumSlug}
            onClick={() => void navigate(`/forums/${forum.slug}`)}
          >
            <ListItemText primary={forum.name} />
          </ListItemButton>
        ))}
      </List>
      <CreateForumDialog
        open={createForumOpen}
        onClose={() => setCreateForumOpen(false)}
      />
    </Box>
  );
}
