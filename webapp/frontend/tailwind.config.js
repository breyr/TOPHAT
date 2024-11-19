/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // from globals.css
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        blue: {
          600: "rgb(41, 90, 183)",
          500: "rgb(29, 105, 204)",
          400: "rgb(19, 155, 235)",
          300: "rgb(171, 199, 250)",
          200: "rgb(208, 224, 252)",
        },
        grey: {
          500: "rgb(136, 144, 153)",
          100: "rgb(247, 247, 247)"
        }
      },
    },
  },
  plugins: [],
}