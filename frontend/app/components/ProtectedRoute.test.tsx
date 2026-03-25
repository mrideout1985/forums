import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { http, HttpResponse } from 'msw';
import { server } from '~/mocks/server';
import { AuthProvider } from '~/providers/AuthProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProtectedRoute from '~/components/ProtectedRoute';
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

describe('ProtectedRoute', () => {
  it('should show loading spinner while auth is loading', () => {
    // The default handler resolves /me successfully but there's a brief loading state
    render(
      <TestApp>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route index element={<div>Dashboard</div>} />
          </Route>
        </Routes>
      </TestApp>
    );

    // Loading spinner should appear initially
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render outlet when authenticated', async () => {
    render(
      <TestApp>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route index element={<div>Dashboard Content</div>} />
          </Route>
        </Routes>
      </TestApp>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
    });
  });

  it('should redirect to /login when not authenticated', async () => {
    server.use(
      http.get('http://localhost:8080/api/auth/me', () => {
        return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
      })
    );

    render(
      <TestApp>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route index element={<div>Dashboard Content</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </TestApp>
    );

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
  });
});
