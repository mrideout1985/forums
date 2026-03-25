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
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { ResponseError } from '~/generated/runtime';
import { useRegister } from '~/hooks/api/useRegister';
import { useAuth } from '~/providers/AuthProvider';
import {
  type RegisterInput,
  registerSchema,
} from '~/validation/authValidation';

// eslint-disable-next-line react-refresh/only-export-components
export function meta() {
  return [{ title: 'Register - Rideout Forums' }];
}

export default function Register() {
  const { isAuthenticated, isLoading } = useAuth();

  const { mutate: register, isPending, error } = useRegister();
  const { control, handleSubmit } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

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
      ? error.response.status === 400
        ? 'Username or email already taken.'
        : 'Something went wrong. Please try again.'
      : error?.message;

  const onSubmit = handleSubmit((data) => {
    register(data);
  });

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
            Create a new account
          </Typography>

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <Box
            component="form"
            noValidate
            onSubmit={(event) => {
              void onSubmit(event);
            }}
          >
            <Controller
              name="username"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Username"
                  name="username"
                  fullWidth
                  sx={{ mb: 2 }}
                  required
                  autoFocus
                  autoComplete="username"
                  inputProps={{ minLength: 3, maxLength: 50 }}
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Email"
                  name="email"
                  type="email"
                  fullWidth
                  sx={{ mb: 2 }}
                  required
                  autoComplete="email"
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="password"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Password"
                  name="password"
                  type="password"
                  fullWidth
                  sx={{ mb: 3 }}
                  required
                  autoComplete="new-password"
                  inputProps={{ minLength: 8 }}
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                />
              )}
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
                  aria-label="Creating account"
                />
              ) : (
                'Create account'
              )}
            </Button>
          </Box>

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Already have an account?{' '}
            <MuiLink component={Link} to="/login">
              Sign in
            </MuiLink>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
