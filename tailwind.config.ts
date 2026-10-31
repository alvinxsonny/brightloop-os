import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#34d399",
          500: "#10b981",
          600: "#00a86b", // Jade Green
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
        },
        jade: {
          50: "#f2fbf6",
          100: "#e1f7ec",
          200: "#c4eed8",
          300: "#98e0bd",
          400: "#63ca9c",
          500: "#38b07e",
          600: "#00a86b", // Pure Jade
          700: "#1e7952",
          800: "#1b6043",
          900: "#174f38",
          950: "#0b2c1f",
        },
        cloudy: {
          50: "#fbfcfb",
          100: "#f4f8f5",
          200: "#e9f1ec",
          300: "#d9e6df",
          400: "#b5cdbf",
          500: "#8cae9a",
          600: "#698e77",
          700: "#52715e",
          800: "#435b4c",
          900: "#394c40",
          950: "#1e2922",
        },
      },
    },
  },
  plugins: [],
};
export default config;
