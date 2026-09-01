import { sleeperGet } from './sleeperClient';

export async function getLeague(leagueId) {
  try {
    return await sleeperGet(`/league/${leagueId}`);
  } catch (err) {
    console.error(`getLeague(${leagueId}) failed`, err);
    throw err;
  }
}

export async function getRosters(leagueId) {
  try {
    return await sleeperGet(`/league/${leagueId}/rosters`);
  } catch (err) {
    console.error(`getRosters(${leagueId}) failed`, err);
    throw err;
  }
}

export async function getLeagueUsers(leagueId) {
  try {
    return await sleeperGet(`/league/${leagueId}/users`);
  } catch (err) {
    console.error(`getLeagueUsers(${leagueId}) failed`, err);
    throw err;
  }
}
