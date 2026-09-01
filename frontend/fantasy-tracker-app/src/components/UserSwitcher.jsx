import { useState } from 'react';
import { useSleeperUser } from '../context/SleeperUserContext';

export function UserSwitcher() {
  const { username, setUsername } = useSleeperUser();
  const [draft, setDraft] = useState(username);

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = draft.trim();
    if (trimmed) setUsername(trimmed);
  };

  return (
    <form className="user-switcher" onSubmit={handleSubmit}>
      <input
        className="input"
        type="text"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Sleeper username"
        aria-label="Sleeper username"
      />
      <button type="submit" className="btn btn-secondary">
        Switch
      </button>
    </form>
  );
}
