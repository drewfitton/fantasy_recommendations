export const queryKeys = {
  nflState: () => ['nflState'],
  user: (username) => ['user', username],
  leagues: (userId, season) => ['leagues', userId, season],
  league: (leagueId) => ['league', leagueId],
  rosters: (leagueId) => ['rosters', leagueId],
  leagueUsers: (leagueId) => ['leagueUsers', leagueId],
  matchups: (leagueId, week) => ['matchups', leagueId, week],
  players: () => ['players'],
  trendingPlayers: (type, lookbackHours, limit) => ['trendingPlayers', type, lookbackHours, limit],
  projections: (season, week) => ['projections', season, week],
};
