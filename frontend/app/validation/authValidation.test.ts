import {
  validateLogin,
  validateLoginField,
  validateRegister,
  validateRegisterField,
} from '~/validation/authValidation';

describe('authValidation', () => {
  it('validates login data and trims username', () => {
    const result = validateLogin({ username: '  user1  ', password: 'secret' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ username: 'user1', password: 'secret' });
    }
  });

  it('returns field errors for invalid login data', () => {
    const result = validateLogin({ username: ' ', password: '' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toEqual({
        username: 'Username is required.',
        password: 'Password is required.',
      });
    }
  });

  it('validates register data and trims username and email', () => {
    const result = validateRegister({
      username: '  newuser  ',
      email: '  test@example.com  ',
      password: 'Password1!',
      confirmPassword: 'Password1!',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        username: 'newuser',
        email: 'test@example.com',
        password: 'Password1!',
        confirmPassword: 'Password1!',
      });
    }
  });

  it('returns register field errors for invalid values', () => {
    const result = validateRegister({
      username: 'ab',
      email: 'bad-email',
      password: 'short',
      confirmPassword: '',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toEqual({
        username: 'Username must be at least 3 characters.',
        email: 'Enter a valid email address.',
        password: 'Password must be at least 6 characters.',
        confirmPassword: 'Confirm password is required.',
      });
    }
  });

  it('returns a confirm password error when passwords do not match', () => {
    const result = validateRegister({
      username: 'newuser',
      email: 'test@example.com',
      password: 'Password1!',
      confirmPassword: 'Password2!',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toEqual({
        confirmPassword: 'Passwords do not match.',
      });
    }
  });

  it('validates individual fields after submit', () => {
    expect(validateLoginField('username', ' ')).toBe('Username is required.');
    expect(validateLoginField('username', 'valid-user')).toBeUndefined();

    expect(validateRegisterField('email', 'bad')).toBe(
      'Enter a valid email address.'
    );
    expect(validateRegisterField('password', 'Password1!')).toBeUndefined();
  });
});
