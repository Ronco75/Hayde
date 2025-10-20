/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Rubik', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
      },
      boxShadow: {
        'elev-1': '0 1px 2px 0 rgb(0 0 0 / 0.2)',
        'elev-2': '0 2px 8px -2px rgb(0 0 0 / 0.35)',
        'elev-3': '0 10px 20px -10px rgb(0 0 0 / 0.5)',
      },
      transitionDuration: {
        '300': '300ms',
      },
      scale: {
        '102': '1.02',
        '105': '1.05',
      },
    },
  },
  plugins: [],
  important: true,
}