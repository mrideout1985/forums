import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NewPostForm from './NewPostForm';

describe('NewPostForm', () => {
  it('should render all form fields', () => {
    render(
      <NewPostForm onSubmit={vi.fn()} onCancel={vi.fn()} isPending={false} />
    );

    expect(screen.getByLabelText('Title *')).toBeInTheDocument();
    expect(screen.getByLabelText('Slug *')).toBeInTheDocument();
    expect(screen.getByLabelText('Body *')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Create Post' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('should show validation errors on empty submit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <NewPostForm onSubmit={onSubmit} onCancel={vi.fn()} isPending={false} />
    );

    await user.click(screen.getByRole('button', { name: 'Create Post' }));

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });
    expect(screen.getByText('Slug is required')).toBeInTheDocument();
    expect(screen.getByText('Body is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should show slug format validation error', async () => {
    const user = userEvent.setup();

    render(
      <NewPostForm onSubmit={vi.fn()} onCancel={vi.fn()} isPending={false} />
    );

    await user.type(screen.getByLabelText('Title *'), 'Test');
    await user.type(screen.getByLabelText('Slug *'), 'INVALID SLUG!');
    await user.type(screen.getByLabelText('Body *'), 'Body text');
    await user.click(screen.getByRole('button', { name: 'Create Post' }));

    await waitFor(() => {
      expect(
        screen.getByText('Slug must be lowercase with hyphens only')
      ).toBeInTheDocument();
    });
  });

  it('should call onSubmit with form data on valid submit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <NewPostForm onSubmit={onSubmit} onCancel={vi.fn()} isPending={false} />
    );

    await user.type(screen.getByLabelText('Title *'), 'My Test Post');
    await user.type(screen.getByLabelText('Body *'), 'This is the body');
    await user.click(screen.getByRole('button', { name: 'Create Post' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        {
          title: 'My Test Post',
          slug: 'my-test-post',
          body: 'This is the body',
        },
        expect.anything()
      );
    });
  });

  it('should call onCancel when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <NewPostForm onSubmit={vi.fn()} onCancel={onCancel} isPending={false} />
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalled();
  });

  it('should disable submit button when pending', () => {
    render(
      <NewPostForm onSubmit={vi.fn()} onCancel={vi.fn()} isPending={true} />
    );

    expect(screen.getByRole('button', { name: 'Creating...' })).toBeDisabled();
  });

  it('should auto-generate slug from title', async () => {
    const user = userEvent.setup();

    render(
      <NewPostForm onSubmit={vi.fn()} onCancel={vi.fn()} isPending={false} />
    );

    await user.type(screen.getByLabelText('Title *'), 'My Test Post!');

    expect(screen.getByLabelText('Slug *')).toHaveValue('my-test-post');
  });

  it('should show slug helper text when no error', () => {
    render(
      <NewPostForm onSubmit={vi.fn()} onCancel={vi.fn()} isPending={false} />
    );

    expect(
      screen.getByText('URL-friendly identifier (e.g. my-post)')
    ).toBeInTheDocument();
  });
});
