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
      "bg": "#c5c5c5",
      "danger": "#e6575c",
      "danger2": "#820000",
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
