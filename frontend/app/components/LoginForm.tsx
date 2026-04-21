import { zodResolver } from '@hookform/resolvers/zod';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link } from 'react-router';
import AuthLayout from '~/components/AuthLayout';
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
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, setFocus } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onFormSubmit: React.SubmitEventHandler<HTMLFormElement> = (event) => {
    void handleSubmit(
      (data) => {
        onSubmit(data);
      },
      (errors) => {
        const firstError = Object.keys(errors)[0] as keyof LoginInput;
        setFocus(firstError);
      }
    )(event);
  };

  return (
    <AuthLayout heading="Welcome back" subtitle="Sign in to your account">
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      <Box component="form" noValidate onSubmit={onFormSubmit}>
        <Stack spacing={2.5}>
          <Controller
            name="username"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Username"
                name="username"
                size="medium"
                fullWidth
                required
                autoFocus
                autoComplete="username"
                slotProps={{ htmlInput: { 'aria-required': true } }}
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
                type={showPassword ? 'text' : 'password'}
                size="medium"
                fullWidth
                required
                autoComplete="current-password"
                slotProps={{
                  htmlInput: { 'aria-required': true },
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={
                            showPassword ? 'Hide password' : 'Show password'
                          }
                          onClick={() => setShowPassword((v) => !v)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
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
            aria-label={isPending ? 'Signing in, please wait' : undefined}
            sx={{ py: 1.4 }}
          >
            {isPending ? (
              <CircularProgress size={22} color="inherit" aria-hidden="true" />
            ) : (
              'Sign in'
            )}
          </Button>
        </Stack>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="body2" align="center">
        Don&apos;t have an account?{' '}
        <MuiLink component={Link} to="/register" fontWeight={500}>
          Create one
        </MuiLink>
      </Typography>
    </AuthLayout>
  );
}
