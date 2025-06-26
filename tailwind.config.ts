import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}", // optional depending on your structure
  ],
  theme: {
    extend: {
      colors: {
        mcblue: "#07153B",
        mcred: "#EC3B3B",
        mcgray: "#DAE6EA",
      },
    },
  },
  plugins: [],
};

export default config;
