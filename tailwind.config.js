/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        arc: {
          cyan: '#00f5ff',
          violet: '#7c3aed',
          magenta: '#e040fb',
          dark: '#050810',
        },
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        syne: ['Syne', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
