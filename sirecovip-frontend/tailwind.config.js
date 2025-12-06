/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f0ff',
          100: '#cce0ff',
          200: '#99c2ff',
          300: '#66a3ff',
          400: '#3385ff',
          500: '#0066ff',
          600: '#0052cc',
          700: '#003d99',
          800: '#002966',
          900: '#001433',
        },
        secondary: {
          50: '#f0f5ff',
          100: '#e0ebff',
          200: '#c2d6ff',
          300: '#a3c2ff',
          400: '#85adff',
          500: '#6699ff',
          600: '#527acc',
          700: '#3d5c99',
          800: '#293d66',
          900: '#141f33',
        },
        accent: {
          50: '#fff4e6',
          100: '#ffe8cc',
          200: '#ffd199',
          300: '#ffba66',
          400: '#ffa333',
          500: '#ff8c00',
          600: '#cc7000',
          700: '#995400',
          800: '#663800',
          900: '#331c00',
        },
        governmental: {
          navy: '#003d7a',
          blue: '#0066cc',
          lightBlue: '#4d94ff',
          sky: '#80b3ff',
          slate: '#475569',
          gold: '#d4af37',
        },
      },
    },
  },
  plugins: [],
}