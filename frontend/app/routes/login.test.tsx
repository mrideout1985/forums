import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { http, HttpResponse } from 'msw';
import { server } from '~/mocks/server';
import { AuthProvider } from '~/providers/AuthProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from '~/routes/login';
import type { ReactNode } from 'react';
import { vi } from 'vitest';

function TestApp({
  children,
  initialEntries = ['/login'],
}: {
  children: ReactNode;
  initialEntries?: string[];
}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Login', () => {
  beforeEach(() => {
    // Default: not authenticated
    server.use(
      http.get('http://localhost:8080/api/auth/me', () => {
        return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
      })
    );
  });

  it('should render the login form', async () => {
    render(
      <TestApp>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </TestApp>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Rideout Forums' })
      ).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Username *')).toBeInTheDocument();
    expect(screen.getByLabelText('Password *')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('should call login API on form submit', async () => {
    const user = userEvent.setup();

    render(
      <TestApp>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<div>Dashboard</div>} />
        </Routes>
      </TestApp>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Username *')).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText('Username *'), 'testuser');
    await user.type(screen.getByLabelText('Password *'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  it('should show field validation errors on empty submit', async () => {
    const user = userEvent.setup();

    render(
      <TestApp>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </TestApp>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Sign in' })
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(screen.getByText('Username is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
    expect(screen.getByLabelText('Username *')).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    expect(screen.getByLabelText('Password *')).toHaveAttribute(
      'aria-invalid',
      'true'
    );
  });

  it('should not call login API when client validation fails', async () => {
    const loginSpy = vi.fn();
    server.use(
      http.post('http://localhost:8080/api/auth/login', async ({ request }) => {
        loginSpy(await request.json());
        return HttpResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      })
    );

    const user = userEvent.setup();

    render(
      <TestApp>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </TestApp>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Sign in' })
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(screen.getByText('Username is required.')).toBeInTheDocument();
    });
    expect(loginSpy).not.toHaveBeenCalled();
  });

  it('should show error message on 401', async () => {
    server.use(
      http.post('http://localhost:8080/api/auth/login', () => {
        return HttpResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      })
    );

    const user = userEvent.setup();

    render(
      <TestApp>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </TestApp>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Username *')).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText('Username *'), 'wrong');
    await user.type(screen.getByLabelText('Password *'), 'wrongpass');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(
        screen.getByText('Invalid username or password.')
      ).toBeInTheDocument();
    });
  });

  it('should redirect to / if already authenticated', async () => {
    // Override: user IS authenticated
    server.use(
      http.get('http://localhost:8080/api/auth/me', () => {
        return HttpResponse.json(
          {
            username: 'testuser',
            email: 'test@example.com',
            roles: ['ROLE_USER'],
          },
          { status: 200 }
        );
      })
    );

    render(
      <TestApp>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<div>Dashboard</div>} />
        </Routes>
      </TestApp>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  it('should have a link to register page', async () => {
    render(
      <TestApp>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </TestApp>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: 'Create one' })
      ).toBeInTheDocument();
    });
  });
});
