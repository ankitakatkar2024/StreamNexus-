/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'stream-dark': '#141414', // Netflix Dark Background
        'stream-red': '#E50914',  // Netflix Red
      },
    },
  },
  plugins: [],
}