import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        mint: "#dff4dd",
        lime: "#cfe857",
        ink: "#132a1d",
        soft: "#f4faf7"
      }
    }
  },
  plugins: []
};

export default config;
