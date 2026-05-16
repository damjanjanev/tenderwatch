import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1.5rem", screens: { "2xl": "1280px" } },
    extend: {
      colors: {
        paper: "#FAF8F3",
        ink: "#1A1A1A",
        muted: "#6B6B6B",
        sand: "#E5E0D5",
        oxblood: "#C8443C",
        forest: "#2D5F3F",
        surface: "#FFFFFF",
        border: "#E5E0D5",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      keyframes: {
        "fade-in": { from: { opacity: "0", transform: "translateY(4px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
      animation: { "fade-in": "fade-in 0.4s ease-out" },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
