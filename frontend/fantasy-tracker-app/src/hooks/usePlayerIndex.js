import { useQuery } from '@tanstack/react-query';
import { getPlayerIndex } from '../services/playerService';
import { queryKeys } from '../queries/keys';

export function usePlayerIndex() {
  return useQuery({
    queryKey: queryKeys.players(),
    queryFn: getPlayerIndex,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
}
