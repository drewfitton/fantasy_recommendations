import { useQuery } from '@tanstack/react-query';
import { getLeaguesForUser } from '../services/userService';
import { queryKeys } from '../queries/keys';

export function useLeagues(userId, season) {
  return useQuery({
    queryKey: queryKeys.leagues(userId, season),
    queryFn: () => getLeaguesForUser(userId, season),
    enabled: Boolean(userId) && Boolean(season),
  });
}
