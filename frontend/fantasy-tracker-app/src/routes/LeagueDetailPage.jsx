import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLeague, useLeagueDetail } from '../hooks/useLeagueDetail';
import { usePlayerIndex } from '../hooks/usePlayerIndex';
import { QueryBoundary } from '../components/QueryBoundary';
import { SleeperAvatar } from '../components/SleeperAvatar';
import { teamName, userAvatarUrl, rosterPoints, playerDisplayName } from '../lib/sleeperUtils';

function RosterDetail({ roster, playerIndex }) {
  const starterSet = new Set(roster.starters ?? []);
  const bench = (roster.players ?? []).filter((id) => !starterSet.has(id));

  return (
    <div className="card elev-sm">
      <span className="card-kicker">Starters</span>
      <ul className="starter-list">
        {(roster.starters ?? []).map((playerId, idx) => (
          <li key={`${playerId}-${idx}`}>{playerDisplayName(playerId, playerIndex)}</li>
        ))}
      </ul>
      {bench.length > 0 && (
        <>
          <span className="card-kicker">Bench</span>
          <ul className="starter-list">
            {bench.map((playerId) => (
              <li key={playerId}>{playerDisplayName(playerId, playerIndex)}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function StandingsRow({ rank, team, isExpanded, onToggle }) {
  const record = team.roster.settings ?? {};
  return (
    <tr onClick={onToggle} style={{ cursor: 'pointer' }} aria-expanded={isExpanded}>
      <td>{rank}</td>
      <td>
        <div className="team-row">
          <SleeperAvatar src={userAvatarUrl(team.user)} size={24} />
          {teamName(team.user)}
        </div>
      </td>
      <td>
        {record.wins ?? 0}-{record.losses ?? 0}-{record.ties ?? 0}
      </td>
      <td>{rosterPoints(record).toFixed(2)}</td>
    </tr>
  );
}

export function LeagueDetailPage() {
  const { leagueId } = useParams();
  const leagueQuery = useLeague(leagueId);
  const { teams, isPending, isError, error } = useLeagueDetail(leagueId);
  const playerIndexQuery = usePlayerIndex();
  const [expandedRosterId, setExpandedRosterId] = useState(null);

  return (
    <QueryBoundary isPending={leagueQuery.isPending} isError={leagueQuery.isError} error={leagueQuery.error}>
      <div className="page-header">
        <h2>{leagueQuery.data?.name}</h2>
        <Link to={`/league/${leagueId}/matchups`} className="btn btn-secondary">
          Matchups
        </Link>
      </div>

      <QueryBoundary isPending={isPending} isError={isError} error={error}>
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Team</th>
                <th>Record</th>
                <th>PF</th>
              </tr>
            </thead>
            <tbody>
              {teams?.map((team, idx) => (
                <StandingsRow
                  key={team.roster.roster_id}
                  rank={idx + 1}
                  team={team}
                  isExpanded={expandedRosterId === team.roster.roster_id}
                  onToggle={() =>
                    setExpandedRosterId((current) =>
                      current === team.roster.roster_id ? null : team.roster.roster_id,
                    )
                  }
                />
              ))}
            </tbody>
          </table>
        </div>

        {expandedRosterId != null &&
          (() => {
            const team = teams.find((t) => t.roster.roster_id === expandedRosterId);
            if (!team) return null;
            return (
              <QueryBoundary isPending={playerIndexQuery.isPending} isError={playerIndexQuery.isError} error={playerIndexQuery.error}>
                <RosterDetail roster={team.roster} playerIndex={playerIndexQuery.data} />
              </QueryBoundary>
            );
          })()}
      </QueryBoundary>
    </QueryBoundary>
  );
}
