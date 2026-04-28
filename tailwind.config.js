/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        surface: 'rgba(0, 20, 0, 0.8)',
        primary: '#39ff14',
        primaryDark: '#008f11',
        danger: '#ff003c',
        warning: '#f59e0b',
        success: '#39ff14',
      },
      fontFamily: {
        mono: ['"Share Tech Mono"', 'monospace'],
        sans: ['"Share Tech Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
