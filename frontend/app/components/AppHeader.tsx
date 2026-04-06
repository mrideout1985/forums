import { useNavigate } from 'react-router';
import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { useAuth } from '~/providers/AuthProvider';
import SearchBar from '~/components/SearchBar';

export default function AppHeader() {
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

  function handleSignOut() {
    signOut();
    void navigate('/login');
  }

  return (
    <header>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            component="a"
            href="/"
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              mr: 2,
              flexShrink: 0,
            }}
          >
            Rideout Forums
          </Typography>
          {isAuthenticated && (
            <Box
              sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}
            >
              <SearchBar />
            </Box>
          )}
          {!isAuthenticated && <Box sx={{ flexGrow: 1 }} />}
          {isAuthenticated ? (
            <>
              <Typography variant="body2" sx={{ mr: 2 }}>
                {user?.username}
              </Typography>
              <Button color="inherit" onClick={handleSignOut}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={() => void navigate('/login')}>
                Sign in
              </Button>
              <Button
                color="inherit"
                onClick={() => void navigate('/register')}
              >
                Register
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
    </header>
  );
}
