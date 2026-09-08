import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F2F4F2",
        surface: "#FFFFFF",
        ink: "#16241C",
        muted: "#5F6F66",
        line: "#E1E6E1",
        accent: "#0B6E4F",
        rise: "#1E7A46",
        fall: "#B23A2E",
      },
      fontFamily: {
        sans: ["var(--font-public-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
