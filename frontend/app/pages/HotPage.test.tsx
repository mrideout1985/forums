import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { server } from '~/mocks/server';
import { AuthProvider } from '~/providers/AuthProvider';
import HotPage from './HotPage';

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

const hotPostsResponse = {
  content: [
    {
      id: '1',
      forumSlug: 'general',
      slug: 'hot-post-1',
      title: 'Hot Post One',
      body: 'This is the first hot post.',
      upvotes: 50,
      downvotes: 5,
      commentCount: 10,
      author: { username: 'poster1' },
      createdAt: '2025-01-15T00:00:00Z',
    },
    {
      id: '2',
      forumSlug: 'tech',
      slug: 'hot-post-2',
      title: 'Hot Post Two',
      body: 'This is the second hot post.',
      upvotes: 30,
      downvotes: 2,
      commentCount: 5,
      author: { username: 'poster2' },
      createdAt: '2025-01-16T00:00:00Z',
    },
  ],
  totalElements: 2,
  totalPages: 1,
  number: 0,
  size: 20,
};

describe('HotPage', () => {
  it('should show loading state initially', () => {
    server.use(
      http.get(`${BASE}/api/posts/hot`, () => {
        return new Promise(() => undefined);
      })
    );

    render(
      <TestApp>
        <HotPage />
      </TestApp>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render hot posts after loading', async () => {
    server.use(
      http.get(`${BASE}/api/posts/hot`, () => {
        return HttpResponse.json(hotPostsResponse);
      })
    );

    render(
      <TestApp>
        <HotPage />
      </TestApp>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Hot Posts' })
      ).toBeInTheDocument();
    });

    expect(screen.getByText('Hot Post One')).toBeInTheDocument();
    expect(screen.getByText('Hot Post Two')).toBeInTheDocument();
  });

  it('should show error message on API failure', async () => {
    server.use(
      http.get(`${BASE}/api/posts/hot`, () => {
        return HttpResponse.json({ error: 'Server error' }, { status: 500 });
      })
    );

    render(
      <TestApp>
        <HotPage />
      </TestApp>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load posts.')).toBeInTheDocument();
    });
  });

  it('should show empty state when no posts', async () => {
    server.use(
      http.get(`${BASE}/api/posts/hot`, () => {
        return HttpResponse.json({ content: [], totalElements: 0 });
      })
    );

    render(
      <TestApp>
        <HotPage />
      </TestApp>
    );

    await waitFor(() => {
      expect(screen.getByText('No hot posts found.')).toBeInTheDocument();
    });
  });
});
