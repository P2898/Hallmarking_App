/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: '#D4AF37',
        dark: '#1A1A1A',
        light: '#F5F5F5',
        white: '#FFFFFF'
      }
    },
  },
  plugins: [],
}
