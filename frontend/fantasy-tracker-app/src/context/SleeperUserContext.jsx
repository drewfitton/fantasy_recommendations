import { createContext, useContext, useMemo, useState } from 'react';

const STORAGE_KEY = 'sleeper-username';
const DEFAULT_USERNAME = import.meta.env.VITE_SLEEPER_USERNAME ?? '';

const SleeperUserContext = createContext(null);

function readStoredUsername() {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_USERNAME;
  } catch {
    return DEFAULT_USERNAME;
  }
}

export function SleeperUserProvider({ children }) {
  const [username, setUsernameState] = useState(readStoredUsername);

  const setUsername = (next) => {
    setUsernameState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage unavailable — the username still works for this session.
    }
  };

  const value = useMemo(() => ({ username, setUsername }), [username]);

  return <SleeperUserContext.Provider value={value}>{children}</SleeperUserContext.Provider>;
}

export function useSleeperUser() {
  const ctx = useContext(SleeperUserContext);
  if (!ctx) throw new Error('useSleeperUser must be used within a SleeperUserProvider');
  return ctx;
}
