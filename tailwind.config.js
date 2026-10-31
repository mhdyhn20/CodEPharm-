/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0E6E73',
          50:  '#E6F2F3',
          100: '#C5E1E3',
          200: '#9DC9CC',
          300: '#73AFB3',
          400: '#4B9397',
          500: '#0E6E73',
          600: '#0B5C60',
          700: '#084A4D',
          800: '#053739',
          900: '#032426',
        },
        success: '#2FBFA3',
        danger: '#E05252',
        warning: '#E4A93B',
        surface: {
          bg: '#F5F8FA',
          card: '#FFFFFF',
          muted: '#F0F4F6',
          border: '#E2E8EC',
        },
        ink: {
          DEFAULT: '#1B2428',
          soft: '#4B5B62',
          muted: '#7E8C92',
          faint: '#B0BBC0',
        },
      },
      fontFamily: {
        sans: ['Vazirmatn', 'Tahoma', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        xl: '0.875rem',
        lg: '0.625rem',
        md: '0.5rem',
      },
      boxShadow: {
        card: '0 2px 10px rgba(14,110,115,0.06), 0 1px 3px rgba(27,36,40,0.04)',
        float: '0 8px 30px rgba(14,110,115,0.12), 0 2px 8px rgba(27,36,40,0.06)',
        focus: '0 0 0 3px rgba(14,110,115,0.25)',
      },
      spacing: {
        18: '4.5rem',
      },
    },
  },
  plugins: [],
};
