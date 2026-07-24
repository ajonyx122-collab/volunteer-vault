/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Nunito"', '"Poppins"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Poppins"', '"Nunito"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        cream: '#FAF9F5',
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
          food: { bg: '#FFF4CC', text: '#8A6D00' },
          art: { bg: '#FBE4EC', text: '#94305C' },
          music: { bg: '#E4EEFB', text: '#1D5B9E' },
          medicine: { bg: '#FBE7E4', text: '#A03A28' },
          animals: { bg: '#F0EAFB', text: '#5B3E9E' },
          education: { bg: '#DDF3F1', text: '#0B6E64' },
          community: { bg: '#E7ECF2', text: '#3A5068' },
          seniors: { bg: '#FBEEDC', text: '#8A5A24' },
          tech: { bg: '#E6E9F8', text: '#3D4A9E' },
          faith: { bg: '#EFE7DC', text: '#6B5138' },
          veterans: { bg: '#E4EFE0', text: '#3E6B2F' },
          disaster: { bg: '#FDE3D9', text: '#B04A22' },
          gardening: { bg: '#EAF4D9', text: '#55701F' },
        },
      },
      borderRadius: {
        pill: '999px',
        card: '16px',
      },
      boxShadow: {
        soft: '0 4px 16px rgba(27, 74, 48, 0.08)',
        card: '0 2px 10px rgba(27, 74, 48, 0.06)',
        // Hard offset "pop" shadows — the 3D sticker-button feel, used on
        // primary CTAs instead of the blurry `soft` shadow. Near-black
        // (not brand-green) so it still reads against the green/gold
        // section backgrounds, not just cream/white ones.
        pop: '4px 4px 0 rgba(15, 26, 20, 0.9)',
        'pop-lg': '6px 6px 0 rgba(15, 26, 20, 0.9)',
        // Softer tan offset shadow for the bolder green-bordered card style
        // (Community/Leaderboards/FAQ) — same hard-edge feel, lighter touch.
        'pop-soft': '7px 7px 0 #EDE6D4',
      },
    },
  },
  plugins: [],
}
