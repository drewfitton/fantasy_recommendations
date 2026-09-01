export function rosterPoints(settings) {
  if (!settings) return 0;
  return (settings.fpts ?? 0) + (settings.fpts_decimal ?? 0) / 100;
}

export function rosterPointsAgainst(settings) {
  if (!settings) return 0;
  return (settings.fpts_against ?? 0) + (settings.fpts_against_decimal ?? 0) / 100;
}

export function teamName(user) {
  if (!user) return 'Unknown team';
  return user.metadata?.team_name || user.display_name || 'Unknown team';
}

export function userAvatarUrl(user) {
  if (!user?.avatar) return null;
  return `https://sleepercdn.com/avatars/thumbs/${user.avatar}`;
}

export function playerHeadshotUrl(playerId) {
  if (!playerId) return null;
  return `https://sleepercdn.com/content/nfl/players/${playerId}.jpg`;
}

export function buildUserMap(users) {
  const map = new Map();
  for (const user of users ?? []) {
    map.set(user.user_id, user);
  }
  return map;
}

export function buildRosterMap(rosters) {
  const map = new Map();
  for (const roster of rosters ?? []) {
    map.set(roster.roster_id, roster);
  }
  return map;
}

export function groupMatchupsByMatchupId(matchups) {
  const groups = new Map();
  for (const entry of matchups ?? []) {
    const key = entry.matchup_id ?? `solo-${entry.roster_id}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(entry);
  }
  return Array.from(groups.values());
}

export function playerEffectiveStatus(player) {
  return player.injury_status || player.status || 'Active';
}

export function playerDisplayName(playerId, playerIndex) {
  const player = playerIndex?.[playerId];
  if (!player) return playerId === '0' ? 'Empty' : `Unknown (${playerId})`;
  return player.full_name || `${player.position ?? ''} ${playerId}`.trim();
}
