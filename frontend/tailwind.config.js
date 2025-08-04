/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        background: '#18181B', // Dark charcoal gray for main background
        primary: '#27272A',   // Lighter gray for sidebars, bubbles
        accent: '#3B82F6',    // Muted blue for buttons, highlights
        'text-primary': '#F4F4F5', // Light gray for primary text
        'text-secondary': '#A1A1AA', // Dimmer gray for secondary text
        border: '#3f3f46',    // Border color
      },
    },
  },
  plugins: [],
};