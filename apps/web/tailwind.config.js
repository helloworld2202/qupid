/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          pink: {
            main: '#F093B0',
            light: '#FDF2F8',
            dark: '#DB7093'
          }
        },
        secondary: {
          blue: {
            main: '#4F7ABA',
            light: '#EBF2FF',
            dark: '#3A5A8A'
          }
        },
        accent: {
          lavender: '#B794F6'
        },
        success: '#0AC5A8',
        warning: '#FF8A00',
        error: {
          DEFAULT: '#FF4757',
          light: '#FFE8EA'
        }
      },
      fontFamily: {
        sans: ['Pretendard', 'Inter', 'sans-serif']
      }
    }
  },
  plugins: []
}