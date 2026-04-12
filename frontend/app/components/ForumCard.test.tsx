import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import ForumCard from './ForumCard';
import type { ForumResponseModel } from '~/generated/models/ForumResponseModel';

const baseForum: ForumResponseModel = {
  id: '1',
  slug: 'test-forum',
  name: 'Test Forum',
  description: 'A test forum description',
  joined: false,
  memberCount: 42,
};

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('ForumCard', () => {
  it('should render forum name and description', () => {
    renderWithRouter(
      <ForumCard
        forum={baseForum}
        isJoinPending={false}
        isLeavePending={false}
        onJoin={vi.fn()}
        onLeave={vi.fn()}
      />
    );

    expect(
      screen.getByRole('heading', { name: 'Test Forum' })
    ).toBeInTheDocument();
    expect(screen.getByText('A test forum description')).toBeInTheDocument();
  });

  it('should render member count', () => {
    renderWithRouter(
      <ForumCard
        forum={baseForum}
        isJoinPending={false}
        isLeavePending={false}
        onJoin={vi.fn()}
        onLeave={vi.fn()}
      />
    );

    expect(screen.getByText('42 members')).toBeInTheDocument();
  });

  it('should render singular member text for 1 member', () => {
    renderWithRouter(
      <ForumCard
        forum={{ ...baseForum, memberCount: 1 }}
        isJoinPending={false}
        isLeavePending={false}
        onJoin={vi.fn()}
        onLeave={vi.fn()}
      />
    );

    expect(screen.getByText('1 member')).toBeInTheDocument();
  });

  it('should show Join button when not joined', () => {
    renderWithRouter(
      <ForumCard
        forum={baseForum}
        isJoinPending={false}
        isLeavePending={false}
        onJoin={vi.fn()}
        onLeave={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Join' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Leave' })
    ).not.toBeInTheDocument();
  });

  it('should show Leave button when joined', () => {
    renderWithRouter(
      <ForumCard
        forum={{ ...baseForum, joined: true }}
        isJoinPending={false}
        isLeavePending={false}
        onJoin={vi.fn()}
        onLeave={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Leave' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Join' })
    ).not.toBeInTheDocument();
  });

  it('should call onJoin with slug when Join is clicked', async () => {
    const user = userEvent.setup();
    const onJoin = vi.fn();

    renderWithRouter(
      <ForumCard
        forum={baseForum}
        isJoinPending={false}
        isLeavePending={false}
        onJoin={onJoin}
        onLeave={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Join' }));

    expect(onJoin).toHaveBeenCalledWith('test-forum');
  });

  it('should call onLeave with slug when Leave is clicked', async () => {
    const user = userEvent.setup();
    const onLeave = vi.fn();

    renderWithRouter(
      <ForumCard
        forum={{ ...baseForum, joined: true }}
        isJoinPending={false}
        isLeavePending={false}
        onJoin={vi.fn()}
        onLeave={onLeave}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Leave' }));

    expect(onLeave).toHaveBeenCalledWith('test-forum');
  });

  it('should disable Join button when join is pending', () => {
    renderWithRouter(
      <ForumCard
        forum={baseForum}
        isJoinPending={true}
        isLeavePending={false}
        onJoin={vi.fn()}
        onLeave={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Join' })).toBeDisabled();
  });

  it('should disable Leave button when leave is pending', () => {
    renderWithRouter(
      <ForumCard
        forum={{ ...baseForum, joined: true }}
        isJoinPending={false}
        isLeavePending={true}
        onJoin={vi.fn()}
        onLeave={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Leave' })).toBeDisabled();
  });
});
