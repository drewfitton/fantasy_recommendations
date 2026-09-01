import { sleeperGet } from './sleeperClient';

export async function getNflState() {
  try {
    return await sleeperGet('/state/nfl');
  } catch (err) {
    console.error('getNflState failed', err);
    throw err;
  }
}
