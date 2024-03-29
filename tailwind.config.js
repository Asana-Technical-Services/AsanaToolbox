/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,tsx}",
    "./pages/**/*.{html,js,tsx}",
    "./common/**/*.{html,js,tsx}",
  ],
  theme: {
    extend: {},
    colors: require('tailwindcss/colors'),
  },
  plugins: [require("@tailwindcss/typography")],
};
