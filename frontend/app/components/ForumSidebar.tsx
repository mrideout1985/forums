import AddIcon from '@mui/icons-material/Add';
import ExploreIcon from '@mui/icons-material/Explore';
import {
  Box,
  Button,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import CreateForumDialog from '~/components/CreateForumDialog';
import { useJoinedForums } from '~/hooks/api/useForumMembership';
import { useAuth } from '~/providers/AuthProvider';

export default function ForumSidebar() {
  const [createForumOpen, setCreateForumOpen] = useState(false);
  const navigate = useNavigate();
  const { forumSlug } = useParams();
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  const { data } = useJoinedForums();
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
        display: 'flex',
        flexDirection: 'column',
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
      <List sx={{ flex: 1, overflow: 'auto' }}>
        {forums.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
            No forums joined yet.
          </Typography>
        ) : (
          forums.map((forum) => (
            <ListItemButton
              key={forum.slug}
              selected={forum.slug === forumSlug}
              onClick={() => navigate(`/forums/${forum.slug}`)}
            >
              <ListItemText primary={forum.name} />
            </ListItemButton>
          ))
        )}
      </List>
      <Divider />
      <List>
        <ListItemButton onClick={() => navigate('/forums')}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            <ExploreIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Explore Forums" />
        </ListItemButton>
      </List>
      <CreateForumDialog
        open={createForumOpen}
        onClose={() => setCreateForumOpen(false)}
      />
    </Box>
  );
}
