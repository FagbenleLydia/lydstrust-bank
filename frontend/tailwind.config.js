/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#eef2f7',
          100: '#d5dff0',
          200: '#aabfe1',
          300: '#7f9fd2',
          400: '#547fc3',
          500: '#2960b4',
          600: '#1f4d91',
          700: '#163a6e',
          800: '#0d274b',
          900: '#0b1f3a',
          950: '#060f1d',
        },
        gold: {
          400: '#e8c84a',
          500: '#c9a84c',
          600: '#a8872a',
        },
      },
    },
  },
  plugins: [],
}
