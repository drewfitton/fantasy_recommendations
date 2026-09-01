import { sleeperGet } from './sleeperClient';

export async function getUser(username) {
  try {
    return await sleeperGet(`/user/${encodeURIComponent(username)}`);
  } catch (err) {
    console.error(`getUser(${username}) failed`, err);
    throw err;
  }
}

export async function getLeaguesForUser(userId, season) {
  try {
    return await sleeperGet(`/user/${encodeURIComponent(userId)}/leagues/nfl/${season}`);
  } catch (err) {
    console.error(`getLeaguesForUser(${userId}, ${season}) failed`, err);
    throw err;
  }
}
