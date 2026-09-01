import { get, set } from 'idb-keyval';

const BASE = 'https://api.sleeper.app/projections/nfl';
const POSITIONS = ['QB', 'RB', 'WR', 'TE', 'K'];
const CACHE_PREFIX = 'sleeper-projections-v1';
const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

function cacheKey(season, week) {
  return `${CACHE_PREFIX}-${season}-${week}`;
}

async function readCache(key) {
  try {
    return (await get(key)) ?? null;
  } catch {
    return null;
  }
}

async function writeCache(key, entry) {
  try {
    await set(key, entry);
  } catch {
    // IndexedDB unavailable (private browsing, quota) — non-fatal, just skip caching.
  }
}

export async function getWeeklyProjections(season, week) {
  const key = cacheKey(season, week);
  const cached = await readCache(key);
  if (cached && Date.now() - cached.savedAt < SIX_HOURS_MS) {
    return cached.projections;
  }

  const qs = POSITIONS.map((pos) => `position[]=${pos}`).join('&');
  const url = `${BASE}/${season}/${week}?season_type=regular&${qs}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Sleeper projections ${res.status} for ${season} week ${week}`);
    }
    const raw = await res.json();
    const projections = {};
    for (const entry of raw) {
      if (!entry.player_id) continue;
      projections[entry.player_id] = {
        pts_half_ppr: entry.stats?.pts_half_ppr ?? null,
        pts_ppr: entry.stats?.pts_ppr ?? null,
      };
    }
    await writeCache(key, { savedAt: Date.now(), projections });
    return projections;
  } catch (err) {
    if (cached) return cached.projections;
    console.error(`getWeeklyProjections(${season}, ${week}) failed`, err);
    throw err;
  }
}
