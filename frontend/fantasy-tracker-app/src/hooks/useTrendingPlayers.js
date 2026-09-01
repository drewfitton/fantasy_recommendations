import { useQuery } from '@tanstack/react-query';
import { getTrendingPlayers } from '../services/playerService';
import { queryKeys } from '../queries/keys';

export function useTrendingPlayers(type, lookbackHours, limit = 30) {
  return useQuery({
    queryKey: queryKeys.trendingPlayers(type, lookbackHours, limit),
    queryFn: () => getTrendingPlayers(type, lookbackHours, limit),
  });
}
