import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { http, HttpResponse } from 'msw';
import { server } from '~/mocks/server';
import { AuthProvider } from '~/providers/AuthProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Register from '~/routes/register';
import type { ReactNode } from 'react';
import { vi } from 'vitest';

function TestApp({
  children,
  initialEntries = ['/register'],
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

describe('Register', () => {
  beforeEach(() => {
    // Default: not authenticated
    server.use(
      http.get('http://localhost:8080/api/auth/me', () => {
        return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
      })
    );
  });

  it('should render the registration form', async () => {
    render(
      <TestApp>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </TestApp>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /rideout forums/i })
      ).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /create account/i })
    ).toBeInTheDocument();
  });

  it('should call register API and navigate on success', async () => {
    const user = userEvent.setup();

    render(
      <TestApp>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<div>Dashboard</div>} />
        </Routes>
      </TestApp>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/username/i), 'newuser');
    await user.type(screen.getByLabelText(/email/i), 'new@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  it('should show field validation errors for invalid register input', async () => {
    const user = userEvent.setup();

    render(
      <TestApp>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </TestApp>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/username/i), 'ab');
    await user.type(screen.getByLabelText(/email/i), 'not-an-email');
    await user.type(screen.getByLabelText(/password/i), 'short');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(
      screen.getByText('Username must be at least 3 characters.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Enter a valid email address.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Password must be at least 8 characters.')
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    expect(screen.getByLabelText(/email/i)).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    expect(screen.getByLabelText(/password/i)).toHaveAttribute(
      'aria-invalid',
      'true'
    );
  });

  it('should not call register API when client validation fails', async () => {
    const registerSpy = vi.fn();
    server.use(
      http.post(
        'http://localhost:8080/api/auth/register',
        async ({ request }) => {
          registerSpy(await request.json());
          return HttpResponse.json(
            { error: 'Username already exists' },
            { status: 400 }
          );
        }
      )
    );

    const user = userEvent.setup();

    render(
      <TestApp>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </TestApp>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /create account/i })
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Username must be at least 3 characters.')
      ).toBeInTheDocument();
    });
    expect(registerSpy).not.toHaveBeenCalled();
  });

  it('should show error message on 400 (duplicate)', async () => {
    server.use(
      http.post('http://localhost:8080/api/auth/register', () => {
        return HttpResponse.json(
          { error: 'Username already exists' },
          { status: 400 }
        );
      })
    );

    const user = userEvent.setup();

    render(
      <TestApp>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </TestApp>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/username/i), 'taken');
    await user.type(screen.getByLabelText(/email/i), 'taken@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/username or email already taken/i)
      ).toBeInTheDocument();
    });
  });

  it('should redirect to / if already authenticated', async () => {
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
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<div>Dashboard</div>} />
        </Routes>
      </TestApp>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  it('should have a link to sign in page', async () => {
    render(
      <TestApp>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </TestApp>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: /sign in/i })
      ).toBeInTheDocument();
    });
  });
});
