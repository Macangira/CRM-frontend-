/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Segoe UI Variable"', '"Inter"', '"Segoe UI"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Segoe UI Variable Display"', '"Segoe UI Variable"', '"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Cascadia Code"', '"SFMono-Regular"', 'Consolas', 'monospace']
      },
      colors: {
        dark: {
          bg: '#1D1B33',
          card: '#22203E',
          border: '#2C2A4C',
          sidebar: '#1B1A30',
          hover: '#2C2A4C',
        },
        // Override Zinc to completely transform the app's dark theme without changing components
        zinc: {
          50: '#F5F5FC',
          100: '#E6E6F2',
          200: '#C7C7DE',
          300: '#A6A6C9',
          400: '#8D8DAB',
          500: '#69698E',
          600: '#4D4D71',
          700: '#383659',
          800: '#2C2A4C',
          900: '#22203E',
          950: '#1D1B33',
        },
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      },
      animation: {
        wave: 'wave 2.5s infinite',
      },
      keyframes: {
        wave: {
          '0%': { transform: 'rotate(0.0deg)' },
          '10%': { transform: 'rotate(14.0deg)' },
          '20%': { transform: 'rotate(-8.0deg)' },
          '30%': { transform: 'rotate(14.0deg)' },
          '40%': { transform: 'rotate(-4.0deg)' },
          '50%': { transform: 'rotate(10.0deg)' },
          '60%': { transform: 'rotate(0.0deg)' },
          '100%': { transform: 'rotate(0.0deg)' },
        }
      }
    },
  },
  plugins: [],
}
