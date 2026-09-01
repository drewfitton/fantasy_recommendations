const POSITION_CLASS = {
  QB: 'tag-accent',
  RB: 'tag-accent-2',
  WR: 'tag-neutral',
  TE: 'tag-outline',
};

export function PositionTag({ position }) {
  if (!position) return null;
  const className = POSITION_CLASS[position] ?? 'tag-neutral';
  return <span className={`tag ${className}`}>{position}</span>;
}
