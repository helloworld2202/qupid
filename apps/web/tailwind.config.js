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
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out forwards',
        'fade-in-up': 'fadeInUp 0.4s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'spin': 'spin 1s linear infinite',
        'bounce': 'bounce 1s infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        }
      }
    }
  },
  plugins: []
}