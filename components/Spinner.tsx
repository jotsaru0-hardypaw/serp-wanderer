// Small inline loading spinner — used anywhere a check/action is in flight.
export function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin motion-reduce:animate-none ${className}`}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      role="img"
      aria-label="Loading"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
