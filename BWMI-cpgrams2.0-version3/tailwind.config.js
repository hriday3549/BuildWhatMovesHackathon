/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'ink-blue': '#1E3A5F',
        'stamp-green': '#2F7A4F',
        'red-tape': '#B4463C',
        'seal-ochre': '#B8863B',
        'ledger-paper': '#F1F5EE',
        'ink-gray': '#4A4A45',
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'sans-serif'],
        serif: ['IBM Plex Serif', 'serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
}
