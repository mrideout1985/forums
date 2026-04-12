import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import PostCard from './PostCard';
import type { PostResponseModel } from '~/generated/models/PostResponseModel';

const basePost: PostResponseModel = {
  id: '1',
  forumSlug: 'test-forum',
  slug: 'test-post',
  title: 'Test Post Title',
  body: 'This is the body of the post with some text.',
  upvotes: 5,
  downvotes: 2,
  userVote: null,
  commentCount: 3,
  author: { username: 'testuser' },
  createdAt: new Date('2025-01-15'),
};

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('PostCard', () => {
  it('should render post title and body preview', () => {
    renderWithRouter(
      <PostCard post={basePost} onVote={vi.fn()} isAuthenticated={false} />
    );

    expect(
      screen.getByRole('heading', { name: 'Test Post Title' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('This is the body of the post with some text.')
    ).toBeInTheDocument();
  });

  it('should render forum slug and author', () => {
    renderWithRouter(
      <PostCard post={basePost} onVote={vi.fn()} isAuthenticated={false} />
    );

    expect(screen.getByText(/r\/test-forum/)).toBeInTheDocument();
    expect(screen.getByText(/testuser/)).toBeInTheDocument();
  });

  it('should render comment count', () => {
    renderWithRouter(
      <PostCard post={basePost} onVote={vi.fn()} isAuthenticated={false} />
    );

    expect(screen.getByText('3 comments')).toBeInTheDocument();
  });

  it('should render vote score', () => {
    renderWithRouter(
      <PostCard post={basePost} onVote={vi.fn()} isAuthenticated={false} />
    );

    expect(screen.getByText('3')).toBeInTheDocument(); // 5 - 2
  });

  it('should disable vote buttons when not authenticated', () => {
    renderWithRouter(
      <PostCard post={basePost} onVote={vi.fn()} isAuthenticated={false} />
    );

    expect(screen.getByRole('button', { name: 'Upvote' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Downvote' })).toBeDisabled();
  });

  it('should enable vote buttons when authenticated', () => {
    renderWithRouter(
      <PostCard post={basePost} onVote={vi.fn()} isAuthenticated={true} />
    );

    expect(screen.getByRole('button', { name: 'Upvote' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Downvote' })).toBeEnabled();
  });

  it('should call onVote with post id and value when voting', async () => {
    const user = userEvent.setup();
    const onVote = vi.fn();

    renderWithRouter(
      <PostCard post={basePost} onVote={onVote} isAuthenticated={true} />
    );

    await user.click(screen.getByRole('button', { name: 'Upvote' }));

    expect(onVote).toHaveBeenCalledWith('1', 1);
  });

  it('should render 0 comments when commentCount is undefined', () => {
    renderWithRouter(
      <PostCard
        post={{ ...basePost, commentCount: undefined }}
        onVote={vi.fn()}
        isAuthenticated={false}
      />
    );

    expect(screen.getByText('0 comments')).toBeInTheDocument();
  });
});
