import { useMemo, useState } from 'react';
import { usePlayerIndex } from '../hooks/usePlayerIndex';
import { useTrendingPlayers } from '../hooks/useTrendingPlayers';
import { useSleeperUser } from '../context/SleeperUserContext';
import { useUser } from '../hooks/useUser';
import { useNflState } from '../hooks/useNflState';
import { useLeagues } from '../hooks/useLeagues';
import { useLeaguesAvailability } from '../hooks/useLeaguesAvailability';
import { useWeeklyProjections } from '../hooks/useWeeklyProjections';
import { QueryBoundary } from '../components/QueryBoundary';
import { PositionTag } from '../components/PositionTag';
import { playerEffectiveStatus } from '../lib/sleeperUtils';

const ALLOWED_POSITIONS = ['QB', 'RB', 'WR', 'TE', 'K'];
const MAX_ROWS = 100;
const LOOKBACK_OPTIONS = [1, 4, 12, 24, 48];
const SORT_DEFAULT_DIR = { depth: 'asc', proj_half: 'desc', proj_ppr: 'desc' };

function sortValue(sortBy, player, projections) {
  if (sortBy === 'proj_half') return projections?.[player.player_id]?.pts_half_ppr ?? -Infinity;
  if (sortBy === 'proj_ppr') return projections?.[player.player_id]?.pts_ppr ?? -Infinity;
  return player.depth_chart_order ?? Infinity;
}

function AvailabilityTag({ entry, playerId }) {
  const owner = entry.ownerMap.get(playerId);
  const shortName = entry.league.name.split(' ')[0];
  const fullName = entry.league.name;

  if (!owner) {
    return (
      <span className="tag tag-outline" title={`${fullName}: Available`}>
        {shortName} · FA
      </span>
    );
  }

  return (
    <span className={`tag ${owner.isYou ? 'tag-accent' : 'tag-neutral'}`} title={`${fullName}: ${owner.teamLabel}`}>
      {shortName} · {owner.isYou ? 'You' : owner.teamLabel}
    </span>
  );
}

function SortableHeader({ label, sortKey, sortBy, sortDir, onSort }) {
  const isActive = sortBy === sortKey;
  return (
    <th>
      <button type="button" className="th-sort" onClick={() => onSort(sortKey)}>
        {label}
        {isActive && <span aria-hidden="true"> {sortDir === 'asc' ? '▲' : '▼'}</span>}
      </button>
    </th>
  );
}

function PlayerTableRow({ player, hasAvailability, availability, trendCount, showProjections, projection }) {
  return (
    <tr>
      {trendCount !== undefined && <td>{trendCount.toLocaleString()}</td>}
      <td>
        <div className="player-name-cell">
          <span>{player.full_name}</span>
          {hasAvailability && (
            <div className="availability-list">
              {availability.isPending ? (
                <span className="text-muted">…</span>
              ) : (
                availability.byLeague.map(
                  (entry) =>
                    entry && <AvailabilityTag key={entry.league.league_id} entry={entry} playerId={player.player_id} />,
                )
              )}
            </div>
          )}
        </div>
      </td>
      <td>
        <PositionTag position={player.position} />
      </td>
      <td>{player.team ?? '—'}</td>
      <td>{player.depth_chart_order ?? '—'}</td>
      <td>{player.injury_status || player.status || '—'}</td>
      {showProjections && (
        <>
          <td>{projection?.pts_half_ppr != null ? projection.pts_half_ppr.toFixed(1) : '—'}</td>
          <td>{projection?.pts_ppr != null ? projection.pts_ppr.toFixed(1) : '—'}</td>
        </>
      )}
    </tr>
  );
}

export function PlayersPage() {
  const [view, setView] = useState('depth');
  const playerIndexQuery = usePlayerIndex();

  const [search, setSearch] = useState('');
  const [position, setPosition] = useState('');
  const [team, setTeam] = useState('');
  const [recommendedOn, setRecommendedOn] = useState(false);
  const [sortBy, setSortBy] = useState('depth');
  const [sortDir, setSortDir] = useState('asc');

  const [trendType, setTrendType] = useState('add');
  const [lookbackHours, setLookbackHours] = useState(1);
  const trendingQuery = useTrendingPlayers(trendType, lookbackHours);

  const { username } = useSleeperUser();
  const userQuery = useUser(username);
  const stateQuery = useNflState();
  const leaguesQuery = useLeagues(userQuery.data?.user_id, stateQuery.data?.season);
  const availability = useLeaguesAvailability(leaguesQuery.data, userQuery.data?.user_id);
  const hasAvailability = Boolean(username);

  const targetWeek = stateQuery.data?.week ? stateQuery.data.week + 1 : undefined;
  const projectionsQuery = useWeeklyProjections(stateQuery.data?.season, targetWeek);

  const eligiblePlayers = useMemo(() => {
    if (!playerIndexQuery.data) return [];
    return Object.values(playerIndexQuery.data).filter(
      (p) => p.full_name && ALLOWED_POSITIONS.includes(p.position),
    );
  }, [playerIndexQuery.data]);

  const teamOptions = useMemo(
    () => [...new Set(eligiblePlayers.map((p) => p.team).filter(Boolean))].sort(),
    [eligiblePlayers],
  );

  const hasInSeasonLeague = useMemo(
    () => availability.byLeague.some((e) => e && e.league.status !== 'pre_draft'),
    [availability.byLeague],
  );
  const recommendedDisabled = !hasAvailability || availability.isPending || !hasInSeasonLeague;
  const recommendedDisabledReason = !hasAvailability
    ? 'Set a username above to use this filter'
    : availability.isPending
      ? 'Loading league data…'
      : 'No in-season leagues yet';
  const effectiveRecommendedOn = recommendedOn && !recommendedDisabled;

  const recommendedSet = useMemo(() => {
    if (recommendedDisabled) return new Set();

    const groups = new Map();
    for (const p of eligiblePlayers) {
      if (!p.team || p.depth_chart_order == null) continue;
      const key = `${p.team}|${p.position}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(p);
    }
    for (const group of groups.values()) {
      group.sort((a, b) => a.depth_chart_order - b.depth_chart_order);
    }

    const inSeasonEntries = availability.byLeague.filter((e) => e && e.league.status !== 'pre_draft');

    const result = new Set();
    for (const group of groups.values()) {
      for (let i = 0; i < group.length; i++) {
        const player = group[i];
        const blockedAbove = group.slice(0, i).some((above) => playerEffectiveStatus(above) === 'Active');
        if (blockedAbove) continue;
        const availableSomewhere = inSeasonEntries.some((e) => !e.ownerMap.has(player.player_id));
        if (availableSomewhere) result.add(player.player_id);
      }
    }
    return result;
  }, [eligiblePlayers, availability.byLeague, recommendedDisabled]);

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortDir(SORT_DEFAULT_DIR[key]);
    }
  };

  const players = useMemo(() => {
    const term = search.trim().toLowerCase();
    const dirMultiplier = sortDir === 'asc' ? 1 : -1;
    return eligiblePlayers
      .filter((p) => (position ? p.position === position : true))
      .filter((p) => (team ? p.team === team : true))
      .filter((p) => (term ? p.full_name.toLowerCase().includes(term) : true))
      .filter((p) => (effectiveRecommendedOn ? recommendedSet.has(p.player_id) : true))
      .sort((a, b) => {
        const aVal = sortValue(sortBy, a, projectionsQuery.data);
        const bVal = sortValue(sortBy, b, projectionsQuery.data);
        if (aVal !== bVal) return (aVal - bVal) * dirMultiplier;
        return (a.full_name ?? '').localeCompare(b.full_name ?? '');
      });
  }, [eligiblePlayers, search, position, team, effectiveRecommendedOn, recommendedSet, sortBy, sortDir, projectionsQuery.data]);

  const trendingPlayers = useMemo(() => {
    if (!trendingQuery.data || !playerIndexQuery.data) return [];
    return trendingQuery.data
      .map((entry) => ({ count: entry.count, player: playerIndexQuery.data[entry.player_id] }))
      .filter((entry) => entry.player && ALLOWED_POSITIONS.includes(entry.player.position))
      .sort((a, b) => b.count - a.count);
  }, [trendingQuery.data, playerIndexQuery.data]);

  const isDepth = view === 'depth';

  return (
    <div>
      <div className="page-header">
        <h2>Players</h2>
        <span className="text-muted">
          {isDepth ? `${players.length} matching` : `${trendingPlayers.length} trending`}
        </span>
      </div>

      <div className="seg">
        <label className="seg-opt">
          <input type="radio" name="view" checked={isDepth} onChange={() => setView('depth')} />
          Depth
        </label>
        <label className="seg-opt">
          <input type="radio" name="view" checked={!isDepth} onChange={() => setView('trending')} />
          Trending
        </label>
      </div>

      {isDepth ? (
        <div className="filter-bar">
          <div className="field">
            <label htmlFor="player-search">Search</label>
            <input
              id="player-search"
              className="input"
              type="text"
              placeholder="Player name"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="position-filter">Position</label>
            <select
              id="position-filter"
              className="input"
              value={position}
              onChange={(event) => setPosition(event.target.value)}
            >
              <option value="">All</option>
              {ALLOWED_POSITIONS.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="team-filter">Team</label>
            <select
              id="team-filter"
              className="input"
              value={team}
              onChange={(event) => setTeam(event.target.value)}
            >
              <option value="">All</option>
              {teamOptions.map((abbr) => (
                <option key={abbr} value={abbr}>
                  {abbr}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className={`btn ${recommendedOn ? 'btn-primary' : 'btn-secondary'}`}
            aria-pressed={recommendedOn}
            disabled={recommendedDisabled}
            title={recommendedDisabled ? recommendedDisabledReason : undefined}
            onClick={() => setRecommendedOn((v) => !v)}
          >
            Recommended
          </button>
        </div>
      ) : (
        <div className="filter-bar">
          <div className="seg">
            <label className="seg-opt">
              <input type="radio" name="trend-type" checked={trendType === 'add'} onChange={() => setTrendType('add')} />
              Add
            </label>
            <label className="seg-opt">
              <input type="radio" name="trend-type" checked={trendType === 'drop'} onChange={() => setTrendType('drop')} />
              Drop
            </label>
          </div>
          <div className="field">
            <label htmlFor="lookback-filter">Lookback</label>
            <select
              id="lookback-filter"
              className="input"
              value={lookbackHours}
              onChange={(event) => setLookbackHours(Number(event.target.value))}
            >
              {LOOKBACK_OPTIONS.map((hours) => (
                <option key={hours} value={hours}>
                  {hours}h
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {hasAvailability && availability.isError && (
        <p className="text-muted">Couldn't load league availability: {availability.error?.message}</p>
      )}

      {isDepth ? (
        <QueryBoundary
          isPending={playerIndexQuery.isPending || projectionsQuery.isPending}
          isError={playerIndexQuery.isError || projectionsQuery.isError}
          error={playerIndexQuery.error ?? projectionsQuery.error}
          isEmpty={players.length === 0}
          emptyMessage="No players match your filters."
        >
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Pos</th>
                  <th>Team</th>
                  <SortableHeader label="Depth" sortKey="depth" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                  <th>Status</th>
                  <SortableHeader
                    label="Proj (Half)"
                    sortKey="proj_half"
                    sortBy={sortBy}
                    sortDir={sortDir}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Proj (PPR)"
                    sortKey="proj_ppr"
                    sortBy={sortBy}
                    sortDir={sortDir}
                    onSort={handleSort}
                  />
                </tr>
              </thead>
              <tbody>
                {players.slice(0, MAX_ROWS).map((player) => (
                  <PlayerTableRow
                    key={player.player_id}
                    player={player}
                    hasAvailability={hasAvailability}
                    availability={availability}
                    showProjections
                    projection={projectionsQuery.data?.[player.player_id]}
                  />
                ))}
              </tbody>
            </table>
          </div>
          {players.length > MAX_ROWS && (
            <p className="text-muted">Showing first {MAX_ROWS} of {players.length} — narrow your search to see more.</p>
          )}
        </QueryBoundary>
      ) : (
        <QueryBoundary
          isPending={playerIndexQuery.isPending || trendingQuery.isPending}
          isError={playerIndexQuery.isError || trendingQuery.isError}
          error={playerIndexQuery.error ?? trendingQuery.error}
          isEmpty={trendingPlayers.length === 0}
          emptyMessage="No trending players for this window."
        >
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Trend</th>
                  <th>Player</th>
                  <th>Pos</th>
                  <th>Team</th>
                  <th>Depth</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {trendingPlayers.map(({ player, count }) => (
                  <PlayerTableRow
                    key={player.player_id}
                    player={player}
                    hasAvailability={hasAvailability}
                    availability={availability}
                    trendCount={count}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </QueryBoundary>
      )}
    </div>
  );
}
