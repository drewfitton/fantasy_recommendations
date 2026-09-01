import { QueryClient } from '@tanstack/react-query';
import { SleeperError } from '../services/sleeperClient';

function shouldRetry(failureCount, error) {
  if (error instanceof SleeperError && error.status >= 400 && error.status < 500) {
    return false;
  }
  return failureCount < 2;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: shouldRetry,
    },
  },
});
