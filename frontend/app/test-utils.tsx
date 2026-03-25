import { render, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, type MemoryRouterProps } from 'react-router';
import { AuthProvider } from '~/providers/AuthProvider';
import type { ReactNode } from 'react';

interface WrapperOptions {
  routerProps?: MemoryRouterProps;
}

function createWrapper({ routerProps }: WrapperOptions = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter {...routerProps}>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </AuthProvider>
      </MemoryRouter>
    );
  };
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { wrapperOptions?: WrapperOptions }
) {
  const { wrapperOptions, ...renderOptions } = options ?? {};
  return render(ui, {
    wrapper: createWrapper(wrapperOptions),
    ...renderOptions,
  });
}
