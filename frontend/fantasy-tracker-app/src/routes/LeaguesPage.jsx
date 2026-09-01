import { Link } from 'react-router-dom';
import { useSleeperUser } from '../context/SleeperUserContext';
import { useUser } from '../hooks/useUser';
import { useNflState } from '../hooks/useNflState';
import { useLeagues } from '../hooks/useLeagues';
import { QueryBoundary } from '../components/QueryBoundary';

function LeagueCard({ league }) {
  const isPreDraft = league.status === 'pre_draft';

  return (
    <Link to={`/league/${league.league_id}`} className="card-link">
      <div className="card elev-sm">
        <span className="card-kicker">{league.season}</span>
        <h3 className="card-title">{league.name}</h3>
        <p className="card-body">{league.total_rosters} teams</p>
        <div className="card-meta">
          <span className={`tag ${isPreDraft ? 'tag-outline' : 'tag-accent'}`}>
            {isPreDraft ? 'Drafting soon' : league.status}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function LeaguesPage() {
  const { username } = useSleeperUser();
  const userQuery = useUser(username);
  const stateQuery = useNflState();

  const season = stateQuery.data?.season;
  const leaguesQuery = useLeagues(userQuery.data?.user_id, season);

  if (!username) {
    return <div className="card elev-sm text-muted">Enter a Sleeper username above to get started.</div>;
  }

  return (
    <QueryBoundary
      isPending={userQuery.isPending || stateQuery.isPending}
      isError={userQuery.isError || stateQuery.isError}
      error={userQuery.error ?? stateQuery.error}
    >
      <div className="page-header">
        <h2>Your leagues</h2>
        <span className="text-muted">{season} season</span>
      </div>
      <QueryBoundary
        isPending={leaguesQuery.isPending}
        isError={leaguesQuery.isError}
        error={leaguesQuery.error}
        isEmpty={leaguesQuery.data && leaguesQuery.data.length === 0}
        emptyMessage={`No leagues found for ${username} in ${season}.`}
      >
        <div className="card-grid">
          {leaguesQuery.data?.map((league) => (
            <LeagueCard key={league.league_id} league={league} />
          ))}
        </div>
      </QueryBoundary>
    </QueryBoundary>
  );
}
