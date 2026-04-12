import { zodResolver } from '@hookform/resolvers/zod';
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
import { Controller, useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { type LoginInput, loginSchema } from '~/validation/authValidation';

interface LoginFormProps {
  isPending: boolean;
  errorMessage?: string;
  onSubmit: (data: LoginInput) => void;
}

export default function LoginForm({
  isPending,
  errorMessage,
  onSubmit,
}: LoginFormProps) {
  const { control, handleSubmit } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onFormSubmit: React.SubmitEventHandler<HTMLFormElement> = (event) => {
    void handleSubmit((data) => {
      onSubmit(data);
    })(event);
  };

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

          <Box component="form" noValidate onSubmit={onFormSubmit}>
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
                  autoComplete="current-password"
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
