/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        taupe: '#8A7564',
        greige: '#A89F94',
        'champagne-gold': '#D6BFAF',
        ivory: '#F9F5F0',
        charcoal: '#1C1C1C'
      },
      fontFamily: {
        'cormorant': ['"Cormorant Garamond"', 'serif'],
        'sans': ['Inter', 'sans-serif']
      },
      spacing: {
        '128': '32rem',
      }
    },
  },
  plugins: [],
}