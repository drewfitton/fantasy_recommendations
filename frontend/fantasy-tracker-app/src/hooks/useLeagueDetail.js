import { useQueries, useQuery } from '@tanstack/react-query';
import { getLeague, getLeagueUsers, getRosters } from '../services/leagueService';
import { queryKeys } from '../queries/keys';
import { buildUserMap } from '../lib/sleeperUtils';

export function useLeague(leagueId) {
  return useQuery({
    queryKey: queryKeys.league(leagueId),
    queryFn: () => getLeague(leagueId),
    enabled: Boolean(leagueId),
  });
}

export function useLeagueDetail(leagueId) {
  const [rostersQuery, usersQuery] = useQueries({
    queries: [
      {
        queryKey: queryKeys.rosters(leagueId),
        queryFn: () => getRosters(leagueId),
        enabled: Boolean(leagueId),
      },
      {
        queryKey: queryKeys.leagueUsers(leagueId),
        queryFn: () => getLeagueUsers(leagueId),
        enabled: Boolean(leagueId),
      },
    ],
  });

  const isPending = rostersQuery.isPending || usersQuery.isPending;
  const isError = rostersQuery.isError || usersQuery.isError;
  const error = rostersQuery.error || usersQuery.error;

  const teams =
    rostersQuery.data && usersQuery.data
      ? (() => {
          const userMap = buildUserMap(usersQuery.data);
          return rostersQuery.data
            .map((roster) => ({
              roster,
              user: userMap.get(roster.owner_id) ?? null,
            }))
            .sort((a, b) => {
              const winsDiff = (b.roster.settings?.wins ?? 0) - (a.roster.settings?.wins ?? 0);
              if (winsDiff !== 0) return winsDiff;
              return (b.roster.settings?.fpts ?? 0) - (a.roster.settings?.fpts ?? 0);
            });
        })()
      : undefined;

  return { teams, isPending, isError, error };
}
