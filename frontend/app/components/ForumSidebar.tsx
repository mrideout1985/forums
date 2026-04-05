import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { ForumsApi } from '~/generated/apis/ForumsApi';
import { useApi } from '~/hooks/useApi';
import { useAuth } from '~/providers/AuthProvider';
import CreateForumDialog from '~/components/CreateForumDialog';

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
        height: '100%',
        overflow: 'auto',
      }}
    >
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="subtitle2" component="h2">
          Forums
        </Typography>
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
