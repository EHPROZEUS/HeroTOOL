/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hero-orange': '#FF6B35',
        'hero-orange-dark': '#E55A2B',
        'hero-accent': '#F7931E',
      },
    },
  },
  plugins: [],
}
