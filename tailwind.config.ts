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
        paper:   "#FFFFFF",
        ink:     "#0A0A0A",
        muted:   "#6B7280",
        sand:    "#E5E7EB",
        oxblood: "#DC2626",
        forest:  "#16A34A",
        surface: "#F9FAFB",
        border:  "#E5E7EB",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans:  ["var(--font-sans)", "system-ui", "sans-serif"],
        mono:  ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: { "fade-in": "fade-in 0.3s ease-out" },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
