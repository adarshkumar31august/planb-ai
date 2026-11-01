/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAF9F6',
        card: '#FFFFFF',
        charcoal: {
          900: '#19181B',
          800: '#27262A',
          700: '#3D3B40',
          600: '#5A5760',
          500: '#75727B',
          400: '#9C98A2',
          300: '#C5C2CB',
          200: '#E4E2E7',
          100: '#F1F0F3',
          50: '#F8F8F9',
        },
        violet: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
          950: '#2E1065',
        },
        accent: {
          light: '#EDE9FE',
          DEFAULT: '#6D28D9',
          dark: '#5B21B6',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 16px -2px rgba(25, 24, 27, 0.05), 0 2px 6px -1px rgba(25, 24, 27, 0.02)',
        'hover': '0 10px 25px -4px rgba(25, 24, 27, 0.08), 0 4px 10px -2px rgba(25, 24, 27, 0.03)',
        'elevated': '0 20px 35px -6px rgba(25, 24, 27, 0.12), 0 8px 16px -4px rgba(25, 24, 27, 0.04)',
      }
    },
  },
  plugins: [],
}
