/**
 * Design Tokens for HeroTOOL
 * Centralized source of truth for colors, spacing, typography, shadows, and radii.
 * These tokens are referenced in CSS variables (tokens.css) and Tailwind config.
 */

const tokens = {
  // Color palette
  colors: {
    // Brand colors
    brand: '#F7931E',
    brandDark: '#e07d06',
    heroOrange: '#FF6B35',
    heroOrangeDark: '#E55A2B',
    heroAccent: '#F7931E',
    
    // Semantic text colors
    text: '#1F2933',
    textMuted: '#5A6572',
    textLight: '#6b7280',
    
    // Backgrounds
    bgPage: '#F7F9FA',
    bgCard: '#FFFFFF',
    bgHover: '#F9FBFC',
    bgSelected: '#FFF6EC',
    
    // Borders
    border: '#E2E8EE',
    borderStrong: '#D1D7DE',
    
    // Focus states
    focus: '#2563EB',
    focusRing: 'rgba(37, 99, 235, 0.15)',
    focusRingBrand: 'rgba(255, 107, 53, 0.15)',
  },

  // Border radius
  radii: {
    sm: '0.375rem',    // 6px
    md: '0.5rem',      // 8px
    lg: '0.75rem',     // 12px
    xl: '1rem',        // 16px
    '2xl': '1.5rem',   // 24px
    card: '0.75rem',   // 12px
    button: '0.625rem', // 10px
  },

  // Box shadows
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 12px rgba(0, 0, 0, 0.1)',
    lg: '0 8px 20px rgba(0, 0, 0, 0.08)',
    xl: '0 15px 40px rgba(0, 0, 0, 0.12)',
    card: '0 4px 12px rgba(0, 0, 0, 0.1)',
    focus: '0 0 0 3px rgba(255, 107, 53, 0.15)',
    focusBlue: '0 0 0 3px rgba(37, 99, 235, 0.15)',
  },

  // Font sizes
  fontSize: {
    xs: '0.8rem',    // 12.8px
    sm: '0.9rem',    // 14.4px
    base: '1rem',    // 16px
    lg: '1.15rem',   // 18.4px
    xl: '1.35rem',   // 21.6px
    '2xl': '1.75rem', // 28px
    '3xl': '2rem',    // 32px
    '4xl': '2.5rem',  // 40px
    '5xl': '3rem',    // 48px
  },

  // Spacing helper (if needed for custom spacing)
  space: {
    xs: '0.5rem',   // 8px
    sm: '0.75rem',  // 12px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '2.5rem', // 40px
  },
};

// Export for use in JavaScript/React
module.exports = tokens;
