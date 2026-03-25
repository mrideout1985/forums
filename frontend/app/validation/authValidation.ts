import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required.'),
  password: z.string().min(1, 'Password is required.'),
});

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters.')
    .max(50, 'Username must be 50 characters or fewer.'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
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
