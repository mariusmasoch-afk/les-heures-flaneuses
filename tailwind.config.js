/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './article.html', './categorie.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['InterVariable', 'Inter', 'system-ui', 'sans-serif'],
        display: ['InterVariable', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: { 50: '#FDF3EE', 100: '#FBDDD2', 400: '#F0714A', 500: '#D13C1B', 600: '#A82E12', 700: '#7E2210' },
        ink: '#2B1B15', paper: '#FAF8F2', pine: '#B4560C', brass: '#F58B2B', salmon: '#F5A080',
      },
    },
  },
  plugins: [],
};
