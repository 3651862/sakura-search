/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sakura: {
          50: '#fef7f9',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
        },
        warm: {
          50: '#faf8f6',
          100: '#f5f0eb',
          200: '#ebe3da',
          300: '#d6c9bb',
          400: '#b8a590',
          500: '#9a8470',
          600: '#7d6b5a',
          700: '#5f5044',
          800: '#423630',
          900: '#2a2018',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.15s ease-out',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'petal-sway': 'petalSway 4s ease-in-out infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
        'deco-float': 'decoFloat 4s ease-in-out infinite',
        'deco-twinkle': 'decoTwinkle 3s ease-in-out infinite',
        'deco-drift': 'decoDrift 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        petalSway: {
          '0%, 100%': { transform: 'rotate(-5deg)' },
          '50%': { transform: 'rotate(5deg)' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        decoFloat: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-8px) rotate(5deg)' },
        },
        decoTwinkle: {
          '0%, 100%': { opacity: '0.15', transform: 'scale(1)' },
          '50%': { opacity: '0.45', transform: 'scale(1.2)' },
        },
        decoDrift: {
          '0%, 100%': { transform: 'translateX(0) translateY(0)' },
          '25%': { transform: 'translateX(6px) translateY(-4px)' },
          '50%': { transform: 'translateX(-3px) translateY(-8px)' },
          '75%': { transform: 'translateX(4px) translateY(-2px)' },
        },
      },
      boxShadow: {
        'sakura': '0 2px 16px -2px rgba(244, 114, 182, 0.15)',
        'sakura-lg': '0 8px 30px -4px rgba(244, 114, 182, 0.2)',
        'warm': '0 2px 12px -2px rgba(154, 132, 112, 0.08)',
      },
    },
  },
  plugins: [],
}
