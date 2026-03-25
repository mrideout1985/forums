import { useState } from 'react';
import { Navigate } from 'react-router';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Link as MuiLink,
  TextField,
  Typography,
} from '@mui/material';
import { Link } from 'react-router';
import { ResponseError } from '~/generated/runtime';
import { useLogin } from '~/hooks/api/useLogin';
import { useAuth } from '~/providers/AuthProvider';

export function meta() {
  return [{ title: 'Sign In - Rideout Forums' }];
}

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { mutate: login, isPending, error } = useLogin();

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
  if (isAuthenticated) return <Navigate to="/" replace />;

  const errorMessage =
    error instanceof ResponseError
      ? error.response.status === 401
        ? 'Invalid username or password.'
        : 'Something went wrong. Please try again.'
      : error?.message;

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
        bgcolor: 'grey.50',
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 420, mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography component="h1" variant="h5" fontWeight={600} mb={1}>
            Rideout Forums
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Sign in to your account
          </Typography>

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              login({ username, password });
            }}
          >
            <TextField
              label="Username"
              name="username"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{ mb: 2 }}
              required
              autoFocus
              autoComplete="username"
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3 }}
              required
              autoComplete="current-password"
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isPending}
            >
              {isPending ? (
                <CircularProgress
                  size={22}
                  color="inherit"
                  aria-label="Signing in"
                />
              ) : (
                'Sign in'
              )}
            </Button>
          </Box>

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Don&apos;t have an account?{' '}
            <MuiLink component={Link} to="/register">
              Create one
            </MuiLink>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
