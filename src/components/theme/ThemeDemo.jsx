import React, { useState } from 'react';

/**
 * ThemeDemo Component
 * Demonstrates the token-based theming system with dark mode toggle.
 * Shows usage of design tokens via CSS classes and variables.
 */
const ThemeDemo = () => {
  const [isDark, setIsDark] = useState(false);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    // Toggle dark class on html element
    if (!isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="card mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
          Theme System Demo
        </h2>
        <button
          onClick={toggleDarkMode}
          className="btn-secondary"
        >
          {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
          Button Components
        </h3>
        <div className="flex flex-wrap gap-3">
          <button className="btn-brand">
            Brand Button
          </button>
          <button className="btn-secondary">
            Secondary Button
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
          Text Colors
        </h3>
        <div className="space-y-2">
          <p style={{ color: 'var(--color-text)' }}>
            Primary Text (--color-text)
          </p>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Muted Text (--color-text-muted)
          </p>
          <p style={{ color: 'var(--color-brand)' }}>
            Brand Color (--color-brand)
          </p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
          Card Components
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
              Nested Card
            </h4>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
              This card uses the .card class with automatic theming support.
            </p>
          </div>
          <div 
            style={{
              backgroundColor: 'var(--color-bg-hover)',
              padding: 'var(--space-lg)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)'
            }}
          >
            <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
              Custom Styled
            </h4>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
              This uses inline CSS variables directly for maximum flexibility.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
          Focus Ring Utilities
        </h3>
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Focus me (brand ring)"
            className="focus-ring-brand px-4 py-2 rounded-md"
            style={{
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg-card)',
              color: 'var(--color-text)'
            }}
          />
          <input
            type="text"
            placeholder="Focus me (blue ring)"
            className="focus-ring-blue px-4 py-2 rounded-md"
            style={{
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg-card)',
              color: 'var(--color-text)'
            }}
          />
        </div>
      </div>

      <div className="mt-6 p-4" style={{ 
        backgroundColor: 'var(--color-bg-selected)', 
        borderRadius: 'var(--radius-md)',
        border: '1px dashed var(--color-brand)'
      }}>
        <p style={{ color: 'var(--color-text)', fontSize: 'var(--font-size-sm)' }}>
          💡 <strong>Tip:</strong> All components automatically adapt to light/dark mode via CSS variables. 
          Try toggling the theme above to see it in action!
        </p>
      </div>
    </div>
  );
};

export default ThemeDemo;
