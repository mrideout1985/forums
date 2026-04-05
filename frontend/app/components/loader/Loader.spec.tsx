import { render, screen } from '@testing-library/react';
import Loader from './Loader';

describe('Loader', () => {
  it('renders children when ready is true', () => {
    render(<Loader ready={true} render={() => <div>Content Loaded</div>} />);
    expect(screen.getByText('Content Loaded')).toBeInTheDocument();
  });

  it('renders a loading spinner when ready is false', () => {
    render(<Loader ready={false} render={() => <div>Content Loaded</div>} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
