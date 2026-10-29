export function Skeleton({
  width = '100%',
  height = '1rem',
  borderRadius = '6px',
  className = '',
  count = 1,
}) {
  const elements = Array.from({ length: count });

  return (
    <>
      {elements.map((_, index) => (
        <div
          key={index}
          className={`skeleton-shimmer ${className}`.trim()}
          style={{
            width,
            height,
            borderRadius,
            marginBottom: count > 1 && index < count - 1 ? '0.5rem' : '0',
          }}
          aria-hidden="true"
        />
      ))}
    </>
  );
}

