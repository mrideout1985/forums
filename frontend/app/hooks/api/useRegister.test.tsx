import { renderHook, waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '~/mocks/server';
import { useRegister } from '~/hooks/api/useRegister';
import { AuthProvider } from '~/providers/AuthProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import type { ReactNode } from 'react';

const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return { ...actual, useNavigate: () => mockNavigate };
});

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </AuthProvider>
      </MemoryRouter>
    );
  };
}

describe('useRegister', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('should register successfully and navigate to /', async () => {
    const { result } = renderHook(() => useRegister(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        username: 'newuser',
        email: 'new@example.com',
        password: 'Password1!',
        confirmPassword: 'Password1!',
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should set error when username is taken', async () => {
    const { result } = renderHook(() => useRegister(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        username: 'taken',
        email: 'taken@example.com',
        password: 'Password1!',
        confirmPassword: 'Password1!',
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should set error on server failure', async () => {
    server.use(
      http.post('http://localhost:8080/api/auth/register', () => {
        return HttpResponse.json({ error: 'Server error' }, { status: 500 });
      })
    );

    const { result } = renderHook(() => useRegister(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        username: 'newuser',
        email: 'new@example.com',
        password: 'Password1!',
        confirmPassword: 'Password1!',
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should be pending during request', async () => {
    const { result } = renderHook(() => useRegister(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(false);

    act(() => {
      result.current.mutate({
        username: 'newuser',
        email: 'new@example.com',
        password: 'Password1!',
        confirmPassword: 'Password1!',
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.isPending).toBe(false);
  });
});
