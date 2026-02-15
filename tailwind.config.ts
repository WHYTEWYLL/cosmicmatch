import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cosmic: {
          dark: "#0a0015",
          mid: "#1a0030",
          purple: "#2d1b69",
          pink: "#e91e8c",
          gold: "#f0c27f",
        },
      },
    },
  },
  plugins: [],
};
export default config;
