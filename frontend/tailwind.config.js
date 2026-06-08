/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        ivory: { DEFAULT: '#F8F4EE', 50: '#FDFBF8', 100: '#F8F4EE' },
        gold: { DEFAULT: '#C9A84C', light: '#E2C97A', dark: '#8B6914', muted: '#D4B96A' },
        burgundy: { DEFAULT: '#6B1F2A', light: '#8B3040', dark: '#3D0F16', muted: '#9B4A56' },
        charcoal: { DEFAULT: '#1A1A2E', light: '#2C2C3E', muted: '#72728A' },
        blush: { DEFAULT: '#F5E8EA', dark: '#D4A0A8' },
        sage: { DEFAULT: '#8A9B8E' },
        surface: '#FFFFFF',
      },
      borderRadius: {
        'pill': '9999px',
        'xl2': '1rem',
      },
      boxShadow: {
        'card': '0 2px 16px rgba(26,26,46,0.06)',
        'card-hover': '0 8px 32px rgba(26,26,46,0.12)',
        'navbar': '0 2px 20px rgba(26,26,46,0.08)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'fade-in': 'fadeIn 0.3s ease forwards',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      }
    },
  },
  plugins: [],
}
