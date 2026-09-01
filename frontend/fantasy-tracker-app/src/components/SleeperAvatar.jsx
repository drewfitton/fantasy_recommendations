import { useState } from 'react';
import { UserCircle } from '@phosphor-icons/react';

export function SleeperAvatar({ src, alt, size = 32 }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <UserCircle size={size} weight="light" className="avatar-fallback" />;
  }

  return (
    <img
      src={src}
      alt={alt ?? ''}
      width={size}
      height={size}
      className="avatar"
      onError={() => setFailed(true)}
    />
  );
}
