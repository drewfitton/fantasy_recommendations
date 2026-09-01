export function QueryBoundary({ isPending, isError, error, isEmpty, emptyMessage, children }) {
  if (isPending) {
    return <div className="card elev-sm text-muted">Loading…</div>;
  }

  if (isError) {
    return (
      <div className="card elev-sm state-error">
        <p className="card-title">Something went wrong</p>
        <p className="card-body">{error?.message ?? 'Unknown error'}</p>
      </div>
    );
  }

  if (isEmpty) {
    return <div className="card elev-sm text-muted">{emptyMessage ?? 'Nothing here yet.'}</div>;
  }

  return children;
}
