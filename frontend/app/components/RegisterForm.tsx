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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { control, handleSubmit, setFocus } = useForm<RegisterInput>({
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
    void handleSubmit(
      (data) => {
        onSubmit(data);
      },
      (errors) => {
        const firstError = Object.keys(errors)[0] as keyof RegisterInput;
        setFocus(firstError);
      }
    )(event);
  };

  const passwordAdornment = (
    show: boolean,
    toggle: React.Dispatch<React.SetStateAction<boolean>>
  ) => (
    <InputAdornment position="end">
      <IconButton
        aria-label={show ? 'Hide password' : 'Show password'}
        onClick={() => toggle((v) => !v)}
        edge="end"
      >
        {show ? <VisibilityOff /> : <Visibility />}
      </IconButton>
    </InputAdornment>
  );

  return (
    <AuthLayout
      heading="Create account"
      subtitle="Get started with Rideout Forums"
    >
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
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Email"
                name="email"
                type="email"
                size="medium"
                fullWidth
                required
                autoComplete="email"
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
                autoComplete="new-password"
                slotProps={{
                  htmlInput: { 'aria-required': true },
                  input: {
                    endAdornment: passwordAdornment(
                      showPassword,
                      setShowPassword
                    ),
                  },
                }}
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
                type={showConfirmPassword ? 'text' : 'password'}
                size="medium"
                fullWidth
                required
                autoComplete="new-password"
                slotProps={{
                  htmlInput: { 'aria-required': true },
                  input: {
                    endAdornment: passwordAdornment(
                      showConfirmPassword,
                      setShowConfirmPassword
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
            aria-label={isPending ? 'Creating account, please wait' : undefined}
            sx={{ py: 1.4 }}
          >
            {isPending ? (
              <CircularProgress size={22} color="inherit" aria-hidden="true" />
            ) : (
              'Create account'
            )}
          </Button>
        </Stack>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="body2" align="center">
        Already have an account?{' '}
        <MuiLink component={Link} to="/login" fontWeight={500}>
          Sign in
        </MuiLink>
      </Typography>
    </AuthLayout>
  );
}
