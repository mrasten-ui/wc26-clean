import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0', 
          800: '#1e40af', // Lighter Blue
          900: '#1e3a8a', // ROYAL BLUE (This fixes the header)
        },
        blue: {
          500: '#3b82f6',
          600: '#2563eb',
        },
        yellow: {
          400: '#fbbf24',
        }
      },
    },
  },
  plugins: [],
};
export default config;