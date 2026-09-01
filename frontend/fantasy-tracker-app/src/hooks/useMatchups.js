import { useQuery } from '@tanstack/react-query';
import { getMatchups } from '../services/matchupService';
import { queryKeys } from '../queries/keys';

export function useMatchups(leagueId, week) {
  return useQuery({
    queryKey: queryKeys.matchups(leagueId, week),
    queryFn: () => getMatchups(leagueId, week),
    enabled: Boolean(leagueId) && Boolean(week),
  });
}
