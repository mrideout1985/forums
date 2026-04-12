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
import {
  type RegisterInput,
  registerSchema,
} from '~/validation/authValidation';

interface RegisterFormProps {
  isPending: boolean;
  errorMessage?: string;
  onSubmit: (data: RegisterInput) => void;
}

export default function RegisterForm({
  isPending,
  errorMessage,
  onSubmit,
}: RegisterFormProps) {
  const { control, handleSubmit } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onFormSubmit: React.SubmitEventHandler = (event) => {
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
            Create a new account
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
                  sx={{ mb: 2 }}
                  required
                  autoComplete="new-password"
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Confirm password"
                  name="confirmPassword"
                  type="password"
                  fullWidth
                  sx={{ mb: 3 }}
                  required
                  autoComplete="new-password"
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
