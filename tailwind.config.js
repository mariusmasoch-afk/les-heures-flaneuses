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
        brand: { 50: '#F6F0E4', 100: '#E4CFA3', 400: '#C1622B', 500: '#A8462F', 600: '#7E3220', 700: '#5B2418' },
        ink: '#24201B', paper: '#EFE7D8', pine: '#2B4E45', brass: '#C79A56',
      },
    },
  },
  plugins: [],
};
