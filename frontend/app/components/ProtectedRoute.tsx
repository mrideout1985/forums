import { Navigate, Outlet } from 'react-router';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '~/providers/AuthProvider';

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box
        component="main"
        id="maincontent"
        tabIndex={-1}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress aria-label="Loading" />
      </Box>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}
