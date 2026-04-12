import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { http, HttpResponse } from 'msw';
import { server } from '~/mocks/server';
import { AuthProvider } from '~/providers/AuthProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import ForumPage from './ForumPage';

const BASE = 'http://localhost:8080';

function TestApp({
  children,
  initialEntries = ['/forums/general'],
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

const forumResponse = {
  id: '1',
  slug: 'general',
  name: 'General Discussion',
  description: 'A general forum for discussion',
  joined: false,
  memberCount: 100,
};

const postsResponse = {
  content: [
    {
      id: '1',
      forumSlug: 'general',
      slug: 'first-post',
      title: 'First Post',
      body: 'Hello world!',
      upvotes: 5,
      downvotes: 1,
      commentCount: 2,
      author: { username: 'poster' },
      createdAt: '2025-01-15T00:00:00Z',
    },
  ],
  totalElements: 1,
  totalPages: 1,
  number: 0,
  size: 20,
};

function setupForumHandlers() {
  server.use(
    http.get(`${BASE}/api/forums/general`, () => {
      return HttpResponse.json(forumResponse);
    }),
    http.get(`${BASE}/api/posts/forum/general`, () => {
      return HttpResponse.json(postsResponse);
    })
  );
}

describe('ForumPage', () => {
  it('should show loading state initially', () => {
    server.use(
      http.get(`${BASE}/api/forums/general`, () => {
        return new Promise(() => undefined);
      }),
      http.get(`${BASE}/api/posts/forum/general`, () => {
        return new Promise(() => undefined);
      })
    );

    render(
      <TestApp>
        <Routes>
          <Route path="/forums/:forumSlug" element={<ForumPage />} />
        </Routes>
      </TestApp>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render forum header and posts after loading', async () => {
    setupForumHandlers();

    render(
      <TestApp>
        <Routes>
          <Route path="/forums/:forumSlug" element={<ForumPage />} />
        </Routes>
      </TestApp>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'General Discussion' })
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText('A general forum for discussion')
    ).toBeInTheDocument();
    expect(screen.getByText('First Post')).toBeInTheDocument();
  });

  it('should show Join button for authenticated user on non-joined forum', async () => {
    setupForumHandlers();

    render(
      <TestApp>
        <Routes>
          <Route path="/forums/:forumSlug" element={<ForumPage />} />
        </Routes>
      </TestApp>
    );

    await waitFor(() => {
      expect(screen.getByText('General Discussion')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Join' })).toBeInTheDocument();
  });

  it('should show Leave button for joined forum', async () => {
    server.use(
      http.get(`${BASE}/api/forums/general`, () => {
        return HttpResponse.json({ ...forumResponse, joined: true });
      }),
      http.get(`${BASE}/api/posts/forum/general`, () => {
        return HttpResponse.json(postsResponse);
      })
    );

    render(
      <TestApp>
        <Routes>
          <Route path="/forums/:forumSlug" element={<ForumPage />} />
        </Routes>
      </TestApp>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Leave' })).toBeInTheDocument();
    });
  });

  it('should show New Post button for authenticated user', async () => {
    setupForumHandlers();

    render(
      <TestApp>
        <Routes>
          <Route path="/forums/:forumSlug" element={<ForumPage />} />
        </Routes>
      </TestApp>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'New Post' })
      ).toBeInTheDocument();
    });
  });

  it('should show error on posts API failure', async () => {
    server.use(
      http.get(`${BASE}/api/forums/general`, () => {
        return HttpResponse.json(forumResponse);
      }),
      http.get(`${BASE}/api/posts/forum/general`, () => {
        return HttpResponse.json({ error: 'Server error' }, { status: 500 });
      })
    );

    render(
      <TestApp>
        <Routes>
          <Route path="/forums/:forumSlug" element={<ForumPage />} />
        </Routes>
      </TestApp>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load forum.')).toBeInTheDocument();
    });
  });

  it('should show empty state when no posts', async () => {
    server.use(
      http.get(`${BASE}/api/forums/general`, () => {
        return HttpResponse.json(forumResponse);
      }),
      http.get(`${BASE}/api/posts/forum/general`, () => {
        return HttpResponse.json({ content: [], totalElements: 0 });
      })
    );

    render(
      <TestApp>
        <Routes>
          <Route path="/forums/:forumSlug" element={<ForumPage />} />
        </Routes>
      </TestApp>
    );

    await waitFor(() => {
      expect(
        screen.getByText('No posts in this forum yet.')
      ).toBeInTheDocument();
    });
  });
});
