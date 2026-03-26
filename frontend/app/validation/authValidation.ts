import { z } from 'zod';

export interface PasswordRule {
  label: string;
  test: (value: string) => boolean;
  message: string;
}

export const passwordRules: PasswordRule[] = [
  {
    label: 'At least 6 characters',
    test: (v) => v.length >= 6,
    message: 'Password must be at least 6 characters.',
  },
  {
    label: 'At least one uppercase letter',
    test: (v) => /[A-Z]/.test(v),
    message: 'Password must contain at least one uppercase letter.',
  },
  {
    label: 'At least one lowercase letter',
    test: (v) => /[a-z]/.test(v),
    message: 'Password must contain at least one lowercase letter.',
  },
  {
    label: 'At least one digit',
    test: (v) => /\d/.test(v),
    message: 'Password must contain at least one digit.',
  },
  {
    label: 'At least one special character (!@#$%^&*())',
    test: (v) => /[!@#$%^&*()]/.test(v),
    message: 'Password must contain at least one special character.',
  },
];

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required.'),
  password: z.string().min(1, 'Password is required.'),
});

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, 'Username must be at least 3 characters.')
      .max(20, 'Username must be 20 characters or fewer.'),
    email: z
      .string()
      .trim()
      .min(1, 'Email is required.')
      .email('Enter a valid email address.'),
    password: z.string().superRefine((val, ctx) => {
      for (const rule of passwordRules) {
        if (!rule.test(val)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: rule.message });
        }
      }
    }),
    confirmPassword: z.string().min(1, 'Confirm password is required.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export type LoginField = keyof LoginInput;
export type RegisterField = keyof RegisterInput;

export type FieldErrors<T extends string> = Partial<Record<T, string>>;

type ValidationResult<TData, TField extends string> =
  | { success: true; data: TData; errors: FieldErrors<TField> }
  | { success: false; errors: FieldErrors<TField> };

function zodIssuesToFieldErrors<TField extends string>(
  issues: z.ZodIssue[]
): FieldErrors<TField> {
  return issues.reduce<FieldErrors<TField>>((errors, issue) => {
    const fieldName = issue.path[0];
    if (typeof fieldName === 'string' && !errors[fieldName as TField]) {
      errors[fieldName as TField] = issue.message;
    }
    return errors;
  }, {});
}

export function validateLogin(values: {
  username: string;
  password: string;
}): ValidationResult<LoginInput, LoginField> {
  const result = loginSchema.safeParse(values);

  if (!result.success) {
    return {
      success: false,
      errors: zodIssuesToFieldErrors<LoginField>(result.error.issues),
    };
  }

  return { success: true, data: result.data, errors: {} };
}

export function validateRegister(values: {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}): ValidationResult<RegisterInput, RegisterField> {
  const result = registerSchema.safeParse(values);

  if (!result.success) {
    return {
      success: false,
      errors: zodIssuesToFieldErrors<RegisterField>(result.error.issues),
    };
  }

  return { success: true, data: result.data, errors: {} };
}

export function validateLoginField(
  field: LoginField,
  value: string
): string | undefined {
  const fieldSchema = loginSchema.shape[field];
  const result = fieldSchema.safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
}

export function validateRegisterField(
  field: RegisterField,
  value: string
): string | undefined {
  const fieldSchema = registerSchema.shape[field];
  const result = fieldSchema.safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
}
