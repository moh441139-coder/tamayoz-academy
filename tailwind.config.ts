import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: {
          DEFAULT: "#0A1414",
          900: "#050B0B",
          800: "#0A1414",
          700: "#0F1E1E",
          600: "#142828",
          500: "#1C3636",
        },
        tamayoz: {
          DEFAULT: "#0B5E5E",
          dark: "#0B5E5E",
          neon: "#4FE3C8",
        },
        rahab: {
          DEFAULT: "#04AE9F",
          teal: "#04AE9F",
          violet: "#6268B0",
        },
      },
      fontFamily: {
        sans: ["Tajawal", "system-ui", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 20px rgba(79, 227, 200, 0.35), 0 0 60px rgba(79, 227, 200, 0.12)",
        "neon-violet": "0 0 20px rgba(98, 104, 176, 0.45), 0 0 60px rgba(98, 104, 176, 0.15)",
        "neon-red": "0 0 18px rgba(239, 68, 68, 0.6)",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
        sweep: {
          "0%": { transform: "translateX(-120%) rotate(12deg)" },
          "100%": { transform: "translateX(220%) rotate(12deg)" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 1.6s ease-in-out infinite",
        sweep: "sweep 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
