/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Legal theme palette
        navy: {
          900: '#1B2A4A',
          800: '#2A3D5C',
          700: '#3A4F6E',
        },
        gold: {
          500: '#C9A227',
          600: '#B89217',
          700: '#A78207',
        },
        cream: {
          50: '#FAF7F0',
          100: '#F5F1E8',
          200: '#EFE9DE',
        },
      },
      fontFamily: {
        serif: ['Merriweather', 'Georgia', 'serif'],
        'serif-display': ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'gavel-tap': {
          '0%, 100%': { transform: 'translateY(0) rotateZ(0deg)' },
          '50%': { transform: 'translateY(8px) rotateZ(15deg)' },
        },
        'scale-tilt': {
          '0%, 100%': { transform: 'perspective(500px) rotateZ(0deg)' },
          '25%': { transform: 'perspective(500px) rotateZ(-8deg)' },
          '75%': { transform: 'perspective(500px) rotateZ(8deg)' },
        },
        'pulse-gold': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      animation: {
        'gavel-tap': 'gavel-tap 1.2s ease-in-out infinite',
        'scale-tilt': 'scale-tilt 2s ease-in-out infinite',
        'pulse-gold': 'pulse-gold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      spacing: {
        'safe-top': 'max(1rem, env(safe-area-inset-top))',
        'safe-bottom': 'max(1rem, env(safe-area-inset-bottom))',
      },
    },
  },
  plugins: [],
}
