/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#1B2430",
          soft: "#3A4656",
        },
        paper: "#EEF0EE",
        card: "#FFFFFF",
        teal: {
          DEFAULT: "#1F6F5C",
          dark: "#165445",
          light: "#E4F0EC",
        },
        gold: {
          DEFAULT: "#C9A227",
          light: "#FBF3DA",
        },
        brick: {
          DEFAULT: "#B4442E",
          light: "#F8E7E2",
        },
        line: "#D8DBD3",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
}
