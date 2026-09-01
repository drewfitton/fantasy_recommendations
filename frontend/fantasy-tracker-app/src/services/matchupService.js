import { sleeperGet } from './sleeperClient';

export async function getMatchups(leagueId, week) {
  try {
    return await sleeperGet(`/league/${leagueId}/matchups/${week}`);
  } catch (err) {
    console.error(`getMatchups(${leagueId}, ${week}) failed`, err);
    throw err;
  }
}
