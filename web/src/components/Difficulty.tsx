import { DIFFICULTY_LABELS } from "../api";

const BARS = [1, 2, 3, 4, 5];

/** Five rising bars, readable at a glance on a card. */
export function DifficultyMeter({
  value,
  showLabel = true,
  className = "",
}: {
  value: number;
  showLabel?: boolean;
  className?: string;
}) {
  const label = DIFFICULTY_LABELS[value] ?? "";

  return (
    <span
      className={`flex items-center gap-2 ${className}`}
      title={`Difficulty: ${label}`}
    >
      <span className="flex items-end gap-[3px]" aria-hidden="true">
        {BARS.map((i) => (
          <span
            key={i}
            style={{ height: `${4 + i * 2}px` }}
            className={`w-[3px] rounded-sm transition-colors ${
              i <= value
                ? "bg-amber-500 dark:bg-amber-400"
                : "bg-stone-300 dark:bg-stone-700"
            }`}
          />
        ))}
      </span>
      {showLabel && <span className="text-sm">{label}</span>}
      <span className="sr-only">Difficulty: {label}</span>
    </span>
  );
}

/** Picker for the admin form. */
export function DifficultyInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div
        role="radiogroup"
        aria-label="How hard was it to make"
        className="mt-2 flex flex-wrap gap-2"
      >
        {BARS.map((level) => {
          const active = value === level;
          return (
            <button
              key={level}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(level)}
              className={`btn px-3.5 py-2 ${
                active
                  ? "btn-primary"
                  : "btn-ghost"
              }`}
            >
              <DifficultyMeter value={level} showLabel={false} />
              <span>{DIFFICULTY_LABELS[level]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
