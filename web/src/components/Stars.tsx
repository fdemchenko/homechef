type StarProps = { filled: boolean; className?: string };

function Star({ filled, className = "h-4 w-4" }: StarProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={`${className} transition-colors ${
        filled
          ? "text-amber-500 dark:text-amber-400"
          : "text-stone-300 dark:text-stone-700"
      }`}
      fill="currentColor"
    >
      <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
    </svg>
  );
}

/** Read-only rating, rounded to the nearest whole star. */
export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className="flex gap-0.5" role="img" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} filled={i <= Math.round(value)} className={className} />
      ))}
    </span>
  );
}

/** Compact "4.5 ★ · 12" pill, used on cards and headers. */
export function RatingBadge({
  average,
  count,
  className = "",
}: {
  average: number;
  count: number;
  className?: string;
}) {
  if (count === 0) {
    return <span className={`muted text-sm ${className}`}>no reviews yet</span>;
  }

  return (
    <span className={`flex items-center gap-1.5 text-sm ${className}`}>
      <Stars value={average} />
      <span className="font-medium tabular-nums">{average.toFixed(1)}</span>
      <span className="muted">
        · {count} {count === 1 ? "review" : "reviews"}
      </span>
    </span>
  );
}

/** Clickable rating used by the review form. */
export function StarInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <span className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          aria-label={`Rate ${i} out of 5`}
          className="rounded-lg transition hover:scale-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-500/25 active:scale-95"
        >
          <Star filled={i <= value} className="h-8 w-8" />
        </button>
      ))}
    </span>
  );
}
