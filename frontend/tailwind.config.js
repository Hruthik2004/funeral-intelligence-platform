/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        slate: {
          850: '#172033',
          950: '#0a0f1a',
        },
        brand: {
          50: '#f0f4ff',
          100: '#e0eaff',
          200: '#c7d7fe',
          300: '#a5bbfc',
          400: '#7b96f8',
          500: '#5a73f3',
          600: '#4555e7',
          700: '#3a44d1',
          800: '#3038a9',
          900: '#2d3585',
          950: '#1a1f50',
        },
        stone: {
          750: '#44403c',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease forwards',
        'slide-up': 'slideUp 0.5s ease forwards',
        'pulse-dot': 'pulseDot 1.4s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseDot: { '0%, 80%, 100%': { transform: 'scale(0)', opacity: '0.5' }, '40%': { transform: 'scale(1)', opacity: '1' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-10px)' } },
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        'glow': '0 0 40px rgba(90, 115, 243, 0.15)',
        'glow-lg': '0 0 80px rgba(90, 115, 243, 0.2)',
        'card': '0 4px 24px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
        'card-hover': '0 12px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}
