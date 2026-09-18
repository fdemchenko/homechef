type Props = {
  value: string;
  onChange: (value: string) => void;
  count?: number;
};

export default function SearchBar({ value, onChange, count }: Props) {
  return (
    <div className="relative">
      <svg
        viewBox="0 0 20 20"
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <circle cx="9" cy="9" r="6" />
        <path d="M13.5 13.5L17 17" />
      </svg>

      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by name, description or ingredient…"
        aria-label="Search recipes"
        className="field pl-11 pr-24"
      />

      {value && (
        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
          {count !== undefined && (
            <span className="muted text-xs tabular-nums">{count}</span>
          )}
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear search"
            className="rounded-full px-2 py-0.5 text-lg leading-none text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
