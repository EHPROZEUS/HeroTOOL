/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  // Ensure specific utility classes used in the app are always generated
  safelist: [
    'p-4', 'p-6', 'md:p-6', 'md:p-8',
    'min-h-screen', 'mx-auto', 'max-w-5xl', 'rounded-2xl',
    { pattern: /^(from|to|bg)-(gray|orange|green|blue|red)-(50|100|200|300|400|500|600|700|800|900)$/ },
    { pattern: /^(grid|md:grid|sm:grid|gap)-/ },
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