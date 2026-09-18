import { Theme, useTheme } from "../theme";

const ICONS: Record<Theme, JSX.Element> = {
  light: (
    <>
      <circle cx="10" cy="10" r="3.6" />
      <path d="M10 1.6v2M10 16.4v2M1.6 10h2M16.4 10h2M4 4l1.4 1.4M14.6 14.6L16 16M16 4l-1.4 1.4M5.4 14.6L4 16" />
    </>
  ),
  system: (
    <>
      <rect x="2.2" y="3.4" width="15.6" height="10.4" rx="1.8" />
      <path d="M7 17h6" />
    </>
  ),
  dark: <path d="M16.2 11.6A6.8 6.8 0 018.4 3.8a6.8 6.8 0 107.8 7.8z" />,
};

const LABELS: Record<Theme, string> = {
  light: "Light",
  system: "Follow system",
  dark: "Dark",
};

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className="flex items-center gap-0.5 rounded-full border border-stone-200 bg-white p-0.5 dark:border-stone-800 dark:bg-stone-900"
    >
      {(Object.keys(ICONS) as Theme[]).map((option) => {
        const active = theme === option;
        return (
          <button
            key={option}
            role="radio"
            aria-checked={active}
            aria-label={LABELS[option]}
            title={LABELS[option]}
            onClick={() => setTheme(option)}
            className={`rounded-full p-1.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 ${
              active
                ? "bg-stone-900 text-amber-300 dark:bg-stone-100 dark:text-amber-600"
                : "text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
            }`}
          >
            <svg
              viewBox="0 0 20 20"
              className="h-4 w-4"
              fill={option === "dark" ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              {ICONS[option]}
            </svg>
          </button>
        );
      })}
    </div>
  );
}
