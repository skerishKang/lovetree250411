/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF69B4',
          light: '#FFB6C1',
          dark: '#FF1493',
        },
        secondary: {
          DEFAULT: '#4A90E2',
          light: '#87CEEB',
          dark: '#2C5282',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
      },
      borderColor: {
        DEFAULT: '#E5E7EB',
      },
    },
  },
  plugins: [],
} 