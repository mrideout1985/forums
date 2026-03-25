import { useNavigate } from 'react-router';
import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from '@mui/material';
import { useAuth } from '~/providers/AuthProvider';

export function meta() {
  return [{ title: 'Dashboard - Rideout Forums' }];
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  function handleSignOut() {
    signOut();
    void navigate('/login');
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <header>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="span" sx={{ flexGrow: 1 }}>
              Rideout Forums
            </Typography>
            <Typography variant="body2" sx={{ mr: 2 }}>
              {user?.username}
            </Typography>
            <Button color="inherit" onClick={handleSignOut}>
              Sign out
            </Button>
          </Toolbar>
        </AppBar>
      </header>
      <Container component="main" id="maincontent" tabIndex={-1} sx={{ mt: 4 }}>
        <Typography component="h1" variant="h4" fontWeight={600} mb={1}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {user?.username}!
        </Typography>
      </Container>
    </Box>
  );
}
