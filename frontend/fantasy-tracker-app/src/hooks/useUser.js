import { useQuery } from '@tanstack/react-query';
import { getUser } from '../services/userService';
import { queryKeys } from '../queries/keys';

export function useUser(username) {
  return useQuery({
    queryKey: queryKeys.user(username),
    queryFn: () => getUser(username),
    enabled: Boolean(username),
  });
}
