import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { server } from '~/mocks/server';
import { AuthProvider } from '~/providers/AuthProvider';
import ForumsPage from './ForumsPage';

const BASE = 'http://localhost:8080';

function TestApp({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return (
    <MemoryRouter>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

const forumsResponse = {
  content: [
    {
      id: '1',
      slug: 'general',
      name: 'General Discussion',
      description: 'Talk about anything',
      joined: false,
      memberCount: 100,
    },
    {
      id: '2',
      slug: 'tech',
      name: 'Technology',
      description: 'Tech topics',
      joined: true,
      memberCount: 50,
    },
  ],
  totalElements: 2,
  totalPages: 1,
  number: 0,
  size: 25,
};

describe('ForumsPage', () => {
  it('should show loading state initially', () => {
    server.use(
      http.get(`${BASE}/api/forums`, () => {
        return new Promise(() => undefined);
      })
    );

    render(
      <TestApp>
        <ForumsPage />
      </TestApp>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render forum cards after loading', async () => {
    server.use(
      http.get(`${BASE}/api/forums`, () => {
        return HttpResponse.json(forumsResponse);
      })
    );

    render(
      <TestApp>
        <ForumsPage />
      </TestApp>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Explore Forums' })
      ).toBeInTheDocument();
    });

    expect(screen.getByText('General Discussion')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('100 members')).toBeInTheDocument();
    expect(screen.getByText('50 members')).toBeInTheDocument();
  });

  it('should show Join for non-joined forums and Leave for joined', async () => {
    server.use(
      http.get(`${BASE}/api/forums`, () => {
        return HttpResponse.json(forumsResponse);
      })
    );

    render(
      <TestApp>
        <ForumsPage />
      </TestApp>
    );

    await waitFor(() => {
      expect(screen.getByText('General Discussion')).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button');
    const joinButtons = buttons.filter((b) => b.textContent === 'Join');
    const leaveButtons = buttons.filter((b) => b.textContent === 'Leave');

    expect(joinButtons.length).toBe(1);
    expect(leaveButtons.length).toBe(1);
  });

  it('should show error message on API failure', async () => {
    server.use(
      http.get(`${BASE}/api/forums`, () => {
        return HttpResponse.json({ error: 'Server error' }, { status: 500 });
      })
    );

    render(
      <TestApp>
        <ForumsPage />
      </TestApp>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load forums.')).toBeInTheDocument();
    });
  });

  it('should show empty state when no forums', async () => {
    server.use(
      http.get(`${BASE}/api/forums`, () => {
        return HttpResponse.json({
          content: [],
          totalElements: 0,
          totalPages: 0,
          number: 0,
          size: 25,
        });
      })
    );

    render(
      <TestApp>
        <ForumsPage />
      </TestApp>
    );

    await waitFor(() => {
      expect(screen.getByText('No forums available.')).toBeInTheDocument();
    });
  });

  it('should show Load more button', async () => {
    server.use(
      http.get(`${BASE}/api/forums`, () => {
        return HttpResponse.json(forumsResponse);
      })
    );

    render(
      <TestApp>
        <ForumsPage />
      </TestApp>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Load more' })
      ).toBeInTheDocument();
    });
  });
});
