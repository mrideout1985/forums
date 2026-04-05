import { useNavigate } from 'react-router';
import { AppBar, Button, Toolbar, Typography } from '@mui/material';
import { useAuth } from '~/providers/AuthProvider';

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
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            Rideout Forums
          </Typography>
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
