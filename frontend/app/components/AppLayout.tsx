import { Box } from '@mui/material';
import { Outlet } from 'react-router';
import AppHeader from '~/components/AppHeader';
import ForumSidebar from '~/components/ForumSidebar';
import { useAuth } from '~/providers/AuthProvider';

export default function AppLayout() {
  const { isAuthenticated } = useAuth();
  console.log(isAuthenticated);
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <AppHeader />
      {isAuthenticated && (
        <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
          <ForumSidebar />
          <Box
            component="main"
            id="maincontent"
            tabIndex={-1}
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
              minHeight: 0,
            }}
          >
            <Outlet />
          </Box>
        </Box>
      )}
    </Box>
  );
}
