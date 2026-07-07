import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('tailwindcss').Config} */
export default {
  content: [path.join(__dirname, 'index.html'), path.join(__dirname, 'src/**/*.{js,jsx}')],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Nunito"', '"Poppins"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Poppins"', '"Nunito"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        cream: '#FDF8EE',
        'brand-green': {
          DEFAULT: '#1B4A30',
          light: '#1B5E38',
        },
        gold: {
          DEFAULT: '#E8983E',
          text: '#4A2B05',
        },
        coral: '#D85A30',
        card: '#FFFFFF',
        'card-border': '#EDE6D4',
        'cream-text': '#FFF7E8',
        'cream-muted': '#B9D4C2',
        category: {
          environment: { bg: '#DFF0E6', text: '#0F5132' },
          sports: { bg: '#FDEBD2', text: '#8A5410' },
          art: { bg: '#FBE4EC', text: '#94305C' },
          music: { bg: '#E4EEFB', text: '#1D5B9E' },
          medicine: { bg: '#FBE7E4', text: '#A03A28' },
          animals: { bg: '#F0EAFB', text: '#5B3E9E' },
        },
      },
      borderRadius: {
        pill: '999px',
        card: '16px',
      },
      boxShadow: {
        soft: '0 4px 16px rgba(27, 74, 48, 0.08)',
        card: '0 2px 10px rgba(27, 74, 48, 0.06)',
      },
    },
  },
  plugins: [],
}
