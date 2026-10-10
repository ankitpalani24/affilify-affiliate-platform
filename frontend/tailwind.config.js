/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f6f8f2',
          100: '#ebf1e1',
          200: '#d8e4c4',
          300: '#bed29e',
          400: '#8da65a',
          500: '#606c38', // Olive Green Primary
          600: '#4f5d2b',
          700: '#3e4a20',
          800: '#2f3818',
          900: '#202710',
          950: '#121708',
          accent: '#bc6c25', // Warm earthy gold/copper accent
        },
        olive: {
          50: '#f5f7f1',
          100: '#e8eedf',
          200: '#d2dfc1',
          300: '#b4cb99',
          400: '#8fae6a',
          500: '#6b8e4e',
          600: '#53713a',
          700: '#41582e',
          800: '#354627',
          900: '#2d3b23',
          dark: '#1c2415',
        },
        surface: {
          50: '#fbfcf9',
          100: '#f5f7f2',
          200: '#e9ece2',
          300: '#dbe0d1',
          card: '#ffffff',
        },
        amazon: {
          DEFAULT: '#FF9900',
          dark: '#146EB4',
          bg: '#131921'
        },
        flipkart: {
          DEFAULT: '#2874F0',
          yellow: '#FFE500'
        },
        myntra: {
          DEFAULT: '#FF3F6C',
          dark: '#535766'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(96, 108, 56, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
        'card': '0 10px 30px -5px rgba(96, 108, 56, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 25px rgba(96, 108, 56, 0.25)',
        'olive': '0 4px 20px -2px rgba(96, 108, 56, 0.2)',
      }
    },
  },
  plugins: [],
}
