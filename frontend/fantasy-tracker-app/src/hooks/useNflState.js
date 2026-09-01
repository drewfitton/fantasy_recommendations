import { useQuery } from '@tanstack/react-query';
import { getNflState } from '../services/stateService';
import { queryKeys } from '../queries/keys';

export function useNflState() {
  return useQuery({
    queryKey: queryKeys.nflState(),
    queryFn: getNflState,
    staleTime: 60 * 60 * 1000,
  });
}
