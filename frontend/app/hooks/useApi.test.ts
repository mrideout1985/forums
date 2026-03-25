import { renderHook } from '@testing-library/react';
import { useApi } from '~/hooks/useApi';
import { AuthenticationApi } from '~/generated/apis/AuthenticationApi';

describe('useApi', () => {
  it('should return an instance of the given API class', () => {
    const { result } = renderHook(() => useApi(AuthenticationApi));

    expect(result.current).toBeInstanceOf(AuthenticationApi);
  });

  it('should return a memoized instance across re-renders', () => {
    const { result, rerender } = renderHook(() => useApi(AuthenticationApi));

    const first = result.current;
    rerender();
    const second = result.current;

    expect(first).toBe(second);
  });
});
