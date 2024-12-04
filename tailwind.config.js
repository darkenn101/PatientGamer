/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{vue,js,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/forms"), require("daisyui")],
  daisyui: {
    themes: ["dracula"], // Add your preferred themes
  },
};
