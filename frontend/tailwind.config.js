/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        mate: {
          50: '#f6f8f6',
          100: '#e7ebe8',
          200: '#cfd7d1',
          300: '#a6b8ab',
          400: '#75937c',
          500: '#507157',
          600: '#3c5842',
          700: '#2d5036',
          800: '#1e3424',
          900: '#142618',
          950: '#0a140d',
        },
        gold: {
          50: '#faf6e8',
          100: '#f3e8c5',
          200: '#e6ce8a',
          300: '#d7b355',
          400: '#c5a059',
          500: '#b08a3f',
          600: '#8e6b2c',
          700: '#6b4d1f',
        },
        cream: {
          50: '#fcfaf6',
          100: '#f5efe4',
          200: '#eee5d3',
          300: '#ded0b5',
          400: '#cbb692',
        },
        wood: {
          50: '#fbf8f3',
          100: '#f6f0e4',
          200: '#eedec7',
          300: '#e1c6a2',
          400: '#d0a777',
          500: '#b88950',
          600: '#9b6c3b',
          700: '#7a512d',
          800: '#5e3e24',
          900: '#452d1c',
          950: '#2c1b10',
        },
        darkness: {
          800: '#1f1f1f',
          900: '#141414',
          950: '#0a0a0a',
        }
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' }
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        }
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pop-in': 'popIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      fontFamily: {
        sans: ['Outfit', 'Montserrat', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
