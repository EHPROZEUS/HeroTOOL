const tokens = require('./src/theme/tokens.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  // Enable dark mode with class strategy
  darkMode: 'class',
  // Ensure specific utility classes used in the app are always generated
  safelist: [
    'p-4', 'p-6', 'md:p-6', 'md:p-8',
    'min-h-screen', 'mx-auto', 'max-w-5xl', 'rounded-2xl',
    { pattern: /^(from|to|bg)-(gray|orange|green|blue|red)-(50|100|200|300|400|500|600|700|800|900)$/ },
    { pattern: /^(grid|md:grid|sm:grid|gap)-/ },
  ],
  theme: {
    extend: {
      // Colors mapped to CSS variables for runtime theming
      colors: {
        'hero-orange': '#FF6B35',
        'hero-orange-dark': '#E55A2B',
        'hero-accent': '#F7931E',
        // Token-based colors
        'brand': 'var(--color-brand)',
        'brand-dark': 'var(--color-brand-dark)',
        'text': 'var(--color-text)',
        'text-muted': 'var(--color-text-muted)',
        'text-light': 'var(--color-text-light)',
        'bg-page': 'var(--color-bg-page)',
        'bg-card': 'var(--color-bg-card)',
        'bg-hover': 'var(--color-bg-hover)',
        'bg-selected': 'var(--color-bg-selected)',
        'border': 'var(--color-border)',
        'border-strong': 'var(--color-border-strong)',
        'focus': 'var(--color-focus)',
      },
      // Border radius from tokens
      borderRadius: {
        'card': 'var(--radius-card)',
        'button': 'var(--radius-button)',
      },
      // Box shadows from tokens
      boxShadow: {
        'card': 'var(--shadow-card)',
        'focus': 'var(--shadow-focus)',
        'focus-blue': 'var(--shadow-focus-blue)',
      },
      // Font sizes from tokens
      fontSize: {
        'xs': 'var(--font-size-xs)',
        'sm': 'var(--font-size-sm)',
        'base': 'var(--font-size-base)',
        'lg': 'var(--font-size-lg)',
        'xl': 'var(--font-size-xl)',
        '2xl': 'var(--font-size-2xl)',
        '3xl': 'var(--font-size-3xl)',
        '4xl': 'var(--font-size-4xl)',
        '5xl': 'var(--font-size-5xl)',
      },
    },
  },
  plugins: [
    // Plugin for component and utility classes
    function({ addComponents, addUtilities }) {
      // Component classes
      addComponents({
        '.card': {
          backgroundColor: 'var(--color-bg-card)',
          borderRadius: 'var(--radius-card)',
          boxShadow: 'var(--shadow-card)',
          padding: '1.5rem',
          border: '1px solid var(--color-border)',
        },
        '.btn-brand': {
          backgroundColor: 'var(--color-brand)',
          color: '#FFFFFF',
          border: '1px solid var(--color-brand)',
          borderRadius: 'var(--radius-button)',
          padding: '0.5rem 1rem',
          fontSize: 'var(--font-size-sm)',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'var(--color-brand-dark)',
            borderColor: 'var(--color-brand-dark)',
          },
          '&:focus': {
            outline: 'none',
            boxShadow: 'var(--shadow-focus)',
          },
        },
        '.btn-secondary': {
          backgroundColor: '#FFFFFF',
          color: 'var(--color-text)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-button)',
          padding: '0.5rem 1rem',
          fontSize: 'var(--font-size-sm)',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'var(--color-bg-hover)',
          },
          '&:focus': {
            outline: 'none',
            boxShadow: 'var(--shadow-focus-blue)',
          },
        },
      });
      
      // Utility classes
      addUtilities({
        '.focus-ring-brand': {
          '&:focus': {
            outline: 'none',
            boxShadow: 'var(--shadow-focus)',
          },
        },
        '.focus-ring-blue': {
          '&:focus': {
            outline: 'none',
            boxShadow: 'var(--shadow-focus-blue)',
          },
        },
      });
    },
  ],
}