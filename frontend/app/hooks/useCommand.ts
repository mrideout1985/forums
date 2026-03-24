import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

export function useCommand<TVariables, TData>(
  commandFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'>
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: commandFn,
    ...options,
  });
}
