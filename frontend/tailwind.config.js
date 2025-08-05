/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"], // Enable class-based dark mode
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        primary: "hsl(var(--primary))",
        accent: "hsl(var(--accent))",
        "text-primary": "hsl(var(--text-primary))",
        "text-secondary": "hsl(var(--text-secondary))",
      },
    },
  },
  plugins: [],
};