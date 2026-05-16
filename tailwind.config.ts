import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1.5rem", screens: { "2xl": "1280px" } },
    extend: {
      borderRadius: {
        sm: "2px",
        md: "3px",
        lg: "4px",
        xl: "6px",
        full: "9999px",
      },
      colors: {
        paper:   "rgb(var(--color-paper)   / <alpha-value>)",
        ink:     "rgb(var(--color-ink)     / <alpha-value>)",
        muted:   "rgb(var(--color-muted)   / <alpha-value>)",
        sand:    "rgb(var(--color-sand)    / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        oxblood: "rgb(var(--color-danger)  / <alpha-value>)",
        forest:  "rgb(var(--color-success) / <alpha-value>)",
        accent:  "rgb(var(--color-accent)  / <alpha-value>)",
        border:  "rgb(var(--color-sand)    / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%":       { opacity: "0.3" },
        },
      },
      animation: {
        "fade-in":  "fade-in 0.3s ease-out",
        "pulse-dot": "pulse-dot 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
