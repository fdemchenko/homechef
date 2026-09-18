/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Fraunces", "ui-serif", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgb(0 0 0 / 0.04), 0 10px 30px -18px rgb(0 0 0 / 0.35)",
        lift: "0 2px 4px rgb(0 0 0 / 0.04), 0 18px 40px -20px rgb(0 0 0 / 0.45)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "none" },
        },
      },
      animation: { "fade-up": "fade-up 0.35s ease-out both" },
    },
  },
  plugins: [],
};
