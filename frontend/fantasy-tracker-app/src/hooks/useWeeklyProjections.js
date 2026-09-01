import { useQuery } from '@tanstack/react-query';
import { getWeeklyProjections } from '../services/projectionService';
import { queryKeys } from '../queries/keys';

export function useWeeklyProjections(season, week) {
  return useQuery({
    queryKey: queryKeys.projections(season, week),
    queryFn: () => getWeeklyProjections(season, week),
    enabled: Boolean(season) && Boolean(week),
    staleTime: 60 * 60 * 1000,
  });
}
