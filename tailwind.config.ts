import type { Config } from 'tailwindcss';

const config: Config = {
  // Important: Use 'class' strategy to avoid conflicts with CSS Modules
  darkMode: ['class', '[data-theme="dark"]'],
  
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  
  // Prefix Tailwind utilities to avoid conflicts (optional but recommended)
  // prefix: 'tw-',
  
  theme: {
    extend: {
      // Map existing CSS variables to Tailwind theme
      colors: {
        // Background colors
        'bg-body': 'var(--bg-body)',
        'bg-surface': 'var(--bg-surface)',
        'bg-elevated': 'var(--bg-elevated)',
        
        // Text colors
        'text-main': 'var(--text-main)',
        'text-muted': 'var(--text-muted)',
        
        // Border colors
        'border-subtle': 'var(--border-subtle)',
        
        // Primary colors
        primary: {
          DEFAULT: 'var(--primary)',
          strong: 'var(--primary-strong)',
          soft: 'var(--primary-soft)',
        },
        
        // Accent colors
        accent: {
          DEFAULT: 'var(--accent)',
          soft: 'var(--accent-soft)',
        },
        
        // Additional semantic colors for shadcn/ui
        border: 'var(--border-subtle)',
        input: 'var(--border-subtle)',
        ring: 'var(--primary)',
        background: 'var(--bg-body)',
        foreground: 'var(--text-main)',
        
        secondary: {
          DEFAULT: 'var(--bg-elevated)',
          foreground: 'var(--text-main)',
        },
        
        muted: {
          DEFAULT: 'var(--bg-surface)',
          foreground: 'var(--text-muted)',
        },
      },
      
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'Fira Sans',
          'Droid Sans',
          'Helvetica Neue',
          'sans-serif',
        ],
      },
      
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  
  plugins: [],
};

export default config;
