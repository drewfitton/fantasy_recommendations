import { useQueries } from '@tanstack/react-query';
import { getLeagueUsers, getRosters } from '../services/leagueService';
import { queryKeys } from '../queries/keys';
import { buildUserMap, teamName } from '../lib/sleeperUtils';

export function useLeaguesAvailability(leagues, currentUserId) {
  const leagueIds = (leagues ?? []).map((l) => l.league_id);

  const rosterQueries = useQueries({
    queries: leagueIds.map((id) => ({
      queryKey: queryKeys.rosters(id),
      queryFn: () => getRosters(id),
    })),
  });

  const userQueries = useQueries({
    queries: leagueIds.map((id) => ({
      queryKey: queryKeys.leagueUsers(id),
      queryFn: () => getLeagueUsers(id),
    })),
  });

  const isPending = rosterQueries.some((q) => q.isPending) || userQueries.some((q) => q.isPending);
  const isError = rosterQueries.some((q) => q.isError) || userQueries.some((q) => q.isError);
  const error = rosterQueries.find((q) => q.error)?.error ?? userQueries.find((q) => q.error)?.error;

  const byLeague = leagueIds.map((leagueId, idx) => {
    const rosters = rosterQueries[idx].data;
    const users = userQueries[idx].data;
    if (!rosters || !users) return null;

    const userMap = buildUserMap(users);
    const ownerMap = new Map();
    for (const roster of rosters) {
      const owner = userMap.get(roster.owner_id) ?? null;
      const isYou = Boolean(currentUserId) && roster.owner_id === currentUserId;
      const entry = { isYou, teamLabel: teamName(owner) };
      for (const playerId of roster.players ?? []) {
        ownerMap.set(playerId, entry);
      }
    }
    return { league: leagues[idx], ownerMap };
  });

  return { byLeague, isPending, isError, error };
}
