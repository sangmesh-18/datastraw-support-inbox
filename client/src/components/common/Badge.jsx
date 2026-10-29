export function Badge({
  children,
  variant = 'gray',
  size = 'md',
  dot = false,
  className = '',
}) {
  return (
    <span className={`badge badge-${variant} badge-${size} ${className}`.trim()}>
      {dot && <span className="badge-dot" aria-hidden="true" />}
      <span>{children}</span>
    </span>
  );
}

