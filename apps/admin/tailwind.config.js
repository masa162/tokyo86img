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
          50: '#f5f7ff',
          100: '#ebf0fe',
          200: '#ced9fd',
          300: '#adc0fb',
          400: '#8ca7f9',
          500: '#6b8ef7', // Main primary color
          600: '#5672c6',
          700: '#405594',
          800: '#2b3963',
          900: '#151c31',
        },
      },
      glass: {
        'background-color': 'rgba(255, 255, 255, 0.7)',
        'backdrop-filter': 'blur(10px)',
      }
    },
  },
  plugins: [],
}
