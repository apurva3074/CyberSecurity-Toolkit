/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        toolkit: {
          bg1: '#EFE9E7',
          bg2: '#DAE0F2',
          accent: '#F9CFF2',
          primary: '#52154E',
          dark: '#111344',
        },
      },
    },
  },
  plugins: [],
};
