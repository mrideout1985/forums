import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PostDetail from './PostDetail';
import type { PostResponseModel } from '~/generated/models/PostResponseModel';

const basePost: PostResponseModel = {
  id: '1',
  forumSlug: 'test-forum',
  slug: 'test-post',
  title: 'Test Post Title',
  body: 'This is the post body content.',
  upvotes: 10,
  downvotes: 3,
  userVote: null,
  commentCount: 5,
  author: { username: 'testuser' },
  createdAt: new Date('2025-01-15'),
};

describe('PostDetail', () => {
  it('should render post title and body', () => {
    render(
      <PostDetail post={basePost} isAuthenticated={false} onVote={vi.fn()} />
    );

    expect(
      screen.getByRole('heading', { name: 'Test Post Title' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('This is the post body content.')
    ).toBeInTheDocument();
  });

  it('should render post metadata', () => {
    render(
      <PostDetail post={basePost} isAuthenticated={false} onVote={vi.fn()} />
    );

    expect(screen.getByText(/r\/test-forum/)).toBeInTheDocument();
    expect(screen.getByText(/testuser/)).toBeInTheDocument();
  });

  it('should render vote buttons with score', () => {
    render(
      <PostDetail post={basePost} isAuthenticated={true} onVote={vi.fn()} />
    );

    expect(screen.getByText('7')).toBeInTheDocument(); // 10 - 3
    expect(screen.getByRole('button', { name: 'Upvote' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Downvote' })).toBeEnabled();
  });

  it('should disable vote buttons when not authenticated', () => {
    render(
      <PostDetail post={basePost} isAuthenticated={false} onVote={vi.fn()} />
    );

    expect(screen.getByRole('button', { name: 'Upvote' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Downvote' })).toBeDisabled();
  });

  it('should call onVote when upvote is clicked', async () => {
    const user = userEvent.setup();
    const onVote = vi.fn();

    render(
      <PostDetail post={basePost} isAuthenticated={true} onVote={onVote} />
    );

    await user.click(screen.getByRole('button', { name: 'Upvote' }));

    expect(onVote).toHaveBeenCalledWith(1);
  });

  it('should call onVote with 0 to toggle off existing upvote', async () => {
    const user = userEvent.setup();
    const onVote = vi.fn();
    const postWithUpvote = { ...basePost, userVote: 1 };

    render(
      <PostDetail
        post={postWithUpvote}
        isAuthenticated={true}
        onVote={onVote}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Upvote' }));

    expect(onVote).toHaveBeenCalledWith(0);
  });
});
