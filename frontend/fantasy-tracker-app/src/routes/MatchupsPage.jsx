import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNflState } from '../hooks/useNflState';
import { useMatchups } from '../hooks/useMatchups';
import { useLeagueDetail } from '../hooks/useLeagueDetail';
import { usePlayerIndex } from '../hooks/usePlayerIndex';
import { QueryBoundary } from '../components/QueryBoundary';
import { teamName, groupMatchupsByMatchupId, playerDisplayName } from '../lib/sleeperUtils';

const WEEK_OPTIONS = Array.from({ length: 18 }, (_, i) => i + 1);

function MatchupCard({ pair, rosterUserMap, playerIndex }) {
  if (pair.length < 2) {
    const [solo] = pair;
    const user = rosterUserMap.get(solo.roster_id);
    return (
      <div className="card elev-sm">
        <span className="card-kicker">Bye</span>
        <p className="card-title">{teamName(user)}</p>
        <p className="card-body">{(solo.points ?? 0).toFixed(2)} pts</p>
      </div>
    );
  }

  const [left, right] = pair;
  const leftUser = rosterUserMap.get(left.roster_id);
  const rightUser = rosterUserMap.get(right.roster_id);

  return (
    <div className="card elev-sm">
      <div className="matchup-pair">
        <div>
          <p className="card-title">{teamName(leftUser)}</p>
          <p className="matchup-score matchup-score-left">{(left.points ?? 0).toFixed(2)}</p>
        </div>
        <span className="matchup-vs">vs</span>
        <div>
          <p className="card-title">{teamName(rightUser)}</p>
          <p className="matchup-score">{(right.points ?? 0).toFixed(2)}</p>
        </div>
      </div>
      <span className="card-kicker">Starters</span>
      <div className="matchup-pair">
        <ul className="starter-list">
          {left.starters?.map((playerId, idx) => (
            <li key={`${playerId}-${idx}`}>{playerDisplayName(playerId, playerIndex)}</li>
          ))}
        </ul>
        <span />
        <ul className="starter-list">
          {right.starters?.map((playerId, idx) => (
            <li key={`${playerId}-${idx}`}>{playerDisplayName(playerId, playerIndex)}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function MatchupsPage() {
  const { leagueId } = useParams();
  const stateQuery = useNflState();
  const [week, setWeek] = useState(null);
  const activeWeek = week ?? stateQuery.data?.week ?? 1;

  const matchupsQuery = useMatchups(leagueId, activeWeek);
  const { teams } = useLeagueDetail(leagueId);
  const playerIndexQuery = usePlayerIndex();

  const rosterUserMap = new Map((teams ?? []).map((t) => [t.roster.roster_id, t.user]));
  const pairs = matchupsQuery.data ? groupMatchupsByMatchupId(matchupsQuery.data) : [];

  return (
    <div>
      <div className="page-header">
        <h2>Matchups</h2>
        <div className="field">
          <label htmlFor="week-select">Week</label>
          <select
            id="week-select"
            className="input"
            value={activeWeek}
            onChange={(event) => setWeek(Number(event.target.value))}
          >
            {WEEK_OPTIONS.map((w) => (
              <option key={w} value={w}>
                Week {w}
              </option>
            ))}
          </select>
        </div>
      </div>

      <QueryBoundary
        isPending={matchupsQuery.isPending}
        isError={matchupsQuery.isError}
        error={matchupsQuery.error}
        isEmpty={pairs.length === 0}
        emptyMessage={`No matchup data yet for week ${activeWeek}.`}
      >
        <div className="card-grid">
          {pairs.map((pair) => (
            <MatchupCard
              key={pair[0].matchup_id ?? pair[0].roster_id}
              pair={pair}
              rosterUserMap={rosterUserMap}
              playerIndex={playerIndexQuery.data}
            />
          ))}
        </div>
      </QueryBoundary>
    </div>
  );
}
