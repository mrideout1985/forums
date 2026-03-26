import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { AuthProvider } from '~/providers/AuthProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from '~/routes/dashboard';
import type { ReactNode } from 'react';

function TestApp({
  children,
  initialEntries = ['/'],
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

describe('Dashboard', () => {
  it('should display the username', async () => {
    render(
      <TestApp>
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </TestApp>
    );

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });
  });

  it('should display welcome message', async () => {
    render(
      <TestApp>
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </TestApp>
    );

    await waitFor(() => {
      expect(screen.getByText('Welcome back, testuser!')).toBeInTheDocument();
    });
  });

  it('should have a sign out button', async () => {
    render(
      <TestApp>
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </TestApp>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Sign out' })
      ).toBeInTheDocument();
    });
  });

  it('should navigate to /login on sign out', async () => {
    const user = userEvent.setup();

    render(
      <TestApp>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </TestApp>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Sign out' })
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Sign out' }));

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  it('should render semantic landmarks', async () => {
    render(
      <TestApp>
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </TestApp>
    );

    await waitFor(() => {
      expect(screen.getAllByRole('banner').length).toBeGreaterThanOrEqual(1);
    });

    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('should display page heading', async () => {
    render(
      <TestApp>
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </TestApp>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Dashboard' })
      ).toBeInTheDocument();
    });
  });
});
