/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.ejs"],
  theme: {
    fontFamily: {
      montserrat: ["Montserrat", "sans-serif"],
    },
    colors: {
      "primary": "#d3a55f",
      "secondary": "#64b2fa",
      "border": "#cecece5d",
      "light": "#828282",
      "dark": "#3c4856",
      "bg": "#a0acbd",
      "danger": "#e6575c",
      "white": "#ffffff",
      "black": "#000000",
    }
  },
  plugins: [],
  purge: {
    enabled: true,
    content: [
        "./views/**/*.ejs",
    ]
  }
}
