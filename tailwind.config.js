/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "modern-blue": {
          dark: "#14161d",
          DEFAULT: "#111115",
        },
      },
    },
  },
  plugins: [],
};
