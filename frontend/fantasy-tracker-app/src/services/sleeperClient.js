export class SleeperError extends Error {
  constructor(message, { status, url, cause } = {}) {
    super(message);
    this.name = 'SleeperError';
    this.status = status;
    this.url = url;
    this.cause = cause;
  }

  get isNotFound() {
    return this.status === 404;
  }
}

const BASE = 'https://api.sleeper.app/v1';

export async function sleeperGet(path) {
  const url = `${BASE}${path}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new SleeperError(`Sleeper ${res.status} for ${path}`, { status: res.status, url });
    }
    return await res.json();
  } catch (err) {
    if (err instanceof SleeperError) throw err;
    throw new SleeperError(`Network error calling ${path}`, { url, cause: err });
  }
}
