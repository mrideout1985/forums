import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CommentCard from './CommentCard';
import type { CommentResponseModel } from '~/generated/models/CommentResponseModel';

const baseComment: CommentResponseModel = {
  id: 1,
  postSlug: 'test-post',
  body: 'This is a comment.',
  upvotes: 4,
  downvotes: 1,
  userVote: null,
  author: { username: 'commenter' },
  createdAt: new Date('2025-02-01'),
  replies: [],
};

const defaultProps = {
  onVote: vi.fn(),
  onReply: vi.fn(),
  onDelete: vi.fn(),
  isReplyPending: false,
  isAuthenticated: true,
  isOwner: () => false,
  isAdmin: false,
};

describe('CommentCard', () => {
  it('should render comment body and author', () => {
    render(<CommentCard comment={baseComment} {...defaultProps} />);

    expect(screen.getByText('This is a comment.')).toBeInTheDocument();
    expect(screen.getByText('commenter')).toBeInTheDocument();
  });

  it('should render vote score', () => {
    render(<CommentCard comment={baseComment} {...defaultProps} />);

    expect(screen.getByText('3')).toBeInTheDocument(); // 4 - 1
  });

  it('should call onVote with comment id and value', async () => {
    const user = userEvent.setup();
    const onVote = vi.fn();

    render(
      <CommentCard comment={baseComment} {...defaultProps} onVote={onVote} />
    );

    await user.click(screen.getByRole('button', { name: 'Upvote' }));

    expect(onVote).toHaveBeenCalledWith(1, 1);
  });

  it('should show delete button when user is owner', () => {
    render(
      <CommentCard
        comment={baseComment}
        {...defaultProps}
        isOwner={() => true}
      />
    );

    expect(
      screen.getByRole('button', { name: 'Delete comment by commenter' })
    ).toBeInTheDocument();
  });

  it('should show delete button when user is admin', () => {
    render(
      <CommentCard comment={baseComment} {...defaultProps} isAdmin={true} />
    );

    expect(
      screen.getByRole('button', { name: 'Delete comment by commenter' })
    ).toBeInTheDocument();
  });

  it('should not show delete button for non-owner non-admin', () => {
    render(<CommentCard comment={baseComment} {...defaultProps} />);

    expect(
      screen.queryByRole('button', { name: 'Delete comment by commenter' })
    ).not.toBeInTheDocument();
  });

  it('should call onDelete with comment id when delete is clicked', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(
      <CommentCard
        comment={baseComment}
        {...defaultProps}
        isOwner={() => true}
        onDelete={onDelete}
      />
    );

    await user.click(
      screen.getByRole('button', { name: 'Delete comment by commenter' })
    );

    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it('should show reply button when authenticated', () => {
    render(
      <CommentCard
        comment={baseComment}
        {...defaultProps}
        isAuthenticated={true}
      />
    );

    expect(screen.getByRole('button', { name: 'Reply' })).toBeInTheDocument();
  });

  it('should not show reply button when not authenticated', () => {
    render(
      <CommentCard
        comment={baseComment}
        {...defaultProps}
        isAuthenticated={false}
      />
    );

    expect(
      screen.queryByRole('button', { name: 'Reply' })
    ).not.toBeInTheDocument();
  });

  it('should disable vote buttons when not authenticated', () => {
    render(
      <CommentCard
        comment={baseComment}
        {...defaultProps}
        isAuthenticated={false}
      />
    );

    expect(screen.getByRole('button', { name: 'Upvote' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Downvote' })).toBeDisabled();
  });

  it('should render nested replies', () => {
    const commentWithReply: CommentResponseModel = {
      ...baseComment,
      replies: [
        {
          id: 2,
          body: 'This is a reply.',
          upvotes: 1,
          downvotes: 0,
          userVote: null,
          author: { username: 'replier' },
          createdAt: new Date('2025-02-02'),
          replies: [],
        },
      ],
    };

    render(<CommentCard comment={commentWithReply} {...defaultProps} />);

    expect(screen.getByText('This is a reply.')).toBeInTheDocument();
    expect(screen.getByText('replier')).toBeInTheDocument();
  });
});
