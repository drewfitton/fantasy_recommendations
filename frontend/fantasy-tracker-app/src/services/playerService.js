import { get, set } from 'idb-keyval';
import { sleeperGet } from './sleeperClient';

const CACHE_KEY = 'sleeper-player-index-v1';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const KEEP_FIELDS = [
  'player_id',
  'full_name',
  'position',
  'fantasy_positions',
  'team',
  'age',
  'number',
  'years_exp',
  'status',
  'injury_status',
  'depth_chart_position',
  'depth_chart_order',
];

function projectPlayer(raw) {
  const projected = {};
  for (const field of KEEP_FIELDS) {
    projected[field] = raw[field] ?? null;
  }
  return projected;
}

async function readCache() {
  try {
    return (await get(CACHE_KEY)) ?? null;
  } catch {
    return null;
  }
}

async function writeCache(entry) {
  try {
    await set(CACHE_KEY, entry);
  } catch {
    // IndexedDB unavailable (private browsing, quota) — non-fatal, just skip caching.
  }
}

export async function getTrendingPlayers(type, lookbackHours, limit = 30) {
  try {
    return await sleeperGet(`/players/nfl/trending/${type}?lookback_hours=${lookbackHours}&limit=${limit}`);
  } catch (err) {
    console.error(`getTrendingPlayers(${type}, ${lookbackHours}) failed`, err);
    throw err;
  }
}

export async function getPlayerIndex() {
  const cached = await readCache();
  if (cached && Date.now() - cached.savedAt < ONE_DAY_MS) {
    return cached.players;
  }

  try {
    const raw = await sleeperGet('/players/nfl');
    const players = {};
    for (const [playerId, playerData] of Object.entries(raw)) {
      players[playerId] = projectPlayer(playerData);
    }
    await writeCache({ savedAt: Date.now(), players });
    return players;
  } catch (err) {
    if (cached) return cached.players;
    throw err;
  }
}
