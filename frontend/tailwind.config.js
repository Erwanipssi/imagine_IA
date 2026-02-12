/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Nunito', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#fef8f3',
          100: '#fdeee3',
          200: '#fad9c2',
          300: '#f5bc94',
          400: '#ef965e',
          500: '#ea7620',
          600: '#db5c16',
          700: '#b54414',
          800: '#903718',
          900: '#742f16',
        },
        accent: {
          50: '#f0fdf9',
          100: '#ccfbef',
          200: '#99f6df',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
        },
        surface: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
        },
      },
      boxShadow: {
        soft: '0 2px 15px -3px rgba(234, 118, 32, 0.08), 0 10px 20px -2px rgba(234, 118, 32, 0.04)',
        card: '0 4px 20px rgba(0,0,0,0.06)',
        'card-hover': '0 12px 40px rgba(0,0,0,0.1)',
        glow: '0 0 40px -10px rgba(234, 118, 32, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      transitionDuration: {
        400: '400ms',
      },
    },
  },
  plugins: [],
}
