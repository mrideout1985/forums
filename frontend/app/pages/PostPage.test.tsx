import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { server } from '~/mocks/server';
import { AuthProvider } from '~/providers/AuthProvider';
import PostPage from './PostPage';

const BASE = 'http://localhost:8080';

function TestApp({
  children,
  initialEntries = ['/forums/general/posts/my-post'],
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

const postResponse = {
  id: '1',
  forumSlug: 'general',
  slug: 'my-post',
  title: 'My Test Post',
  body: 'This is the full post body.',
  upvotes: 10,
  downvotes: 2,
  userVote: null,
  commentCount: 2,
  author: { username: 'poster' },
  createdAt: '2025-01-15T00:00:00Z',
};

const commentsResponse = [
  {
    id: 1,
    postSlug: 'my-post',
    body: 'Great post!',
    upvotes: 3,
    downvotes: 0,
    userVote: null,
    author: { username: 'commenter1' },
    createdAt: '2025-01-16T00:00:00Z',
    replies: [],
  },
  {
    id: 2,
    postSlug: 'my-post',
    body: 'I disagree.',
    upvotes: 1,
    downvotes: 1,
    userVote: null,
    author: { username: 'commenter2' },
    createdAt: '2025-01-17T00:00:00Z',
    replies: [],
  },
];

function setupPostHandlers() {
  server.use(
    http.get(`${BASE}/api/posts/my-post`, () => {
      return HttpResponse.json(postResponse);
    }),
    http.get(`${BASE}/api/comments/post/my-post`, () => {
      return HttpResponse.json(commentsResponse);
    })
  );
}

describe('PostPage', () => {
  it('should show loading state initially', () => {
    server.use(
      http.get(`${BASE}/api/posts/my-post`, () => {
        return new Promise(() => undefined);
      }),
      http.get(`${BASE}/api/comments/post/my-post`, () => {
        return new Promise(() => undefined);
      })
    );

    render(
      <TestApp>
        <Routes>
          <Route
            path="/forums/:forumSlug/posts/:postSlug"
            element={<PostPage />}
          />
        </Routes>
      </TestApp>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render post content after loading', async () => {
    setupPostHandlers();

    render(
      <TestApp>
        <Routes>
          <Route
            path="/forums/:forumSlug/posts/:postSlug"
            element={<PostPage />}
          />
        </Routes>
      </TestApp>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'My Test Post' })
      ).toBeInTheDocument();
    });

    expect(screen.getByText('This is the full post body.')).toBeInTheDocument();
    expect(screen.getByText(/poster/)).toBeInTheDocument();
  });

  it('should render comments', async () => {
    setupPostHandlers();

    render(
      <TestApp>
        <Routes>
          <Route
            path="/forums/:forumSlug/posts/:postSlug"
            element={<PostPage />}
          />
        </Routes>
      </TestApp>
    );

    await waitFor(() => {
      expect(screen.getByText('Great post!')).toBeInTheDocument();
    });

    expect(screen.getByText('I disagree.')).toBeInTheDocument();
    expect(screen.getByText('commenter1')).toBeInTheDocument();
    expect(screen.getByText('commenter2')).toBeInTheDocument();
  });

  it('should show comment count heading', async () => {
    setupPostHandlers();

    render(
      <TestApp>
        <Routes>
          <Route
            path="/forums/:forumSlug/posts/:postSlug"
            element={<PostPage />}
          />
        </Routes>
      </TestApp>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Comments (2)' })
      ).toBeInTheDocument();
    });
  });

  it('should show comment form for authenticated user', async () => {
    setupPostHandlers();

    render(
      <TestApp>
        <Routes>
          <Route
            path="/forums/:forumSlug/posts/:postSlug"
            element={<PostPage />}
          />
        </Routes>
      </TestApp>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Add a comment' })
      ).toBeInTheDocument();
    });
  });

  it('should show error on post API failure', async () => {
    server.use(
      http.get(`${BASE}/api/posts/my-post`, () => {
        return HttpResponse.json({ error: 'Not found' }, { status: 404 });
      }),
      http.get(`${BASE}/api/comments/post/my-post`, () => {
        return HttpResponse.json([]);
      })
    );

    render(
      <TestApp>
        <Routes>
          <Route
            path="/forums/:forumSlug/posts/:postSlug"
            element={<PostPage />}
          />
        </Routes>
      </TestApp>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load post.')).toBeInTheDocument();
    });
  });

  it('should show empty comments state', async () => {
    server.use(
      http.get(`${BASE}/api/posts/my-post`, () => {
        return HttpResponse.json({ ...postResponse, commentCount: 0 });
      }),
      http.get(`${BASE}/api/comments/post/my-post`, () => {
        return HttpResponse.json([]);
      })
    );

    render(
      <TestApp>
        <Routes>
          <Route
            path="/forums/:forumSlug/posts/:postSlug"
            element={<PostPage />}
          />
        </Routes>
      </TestApp>
    );

    await waitFor(() => {
      expect(screen.getByText('No comments yet.')).toBeInTheDocument();
    });
  });
});
