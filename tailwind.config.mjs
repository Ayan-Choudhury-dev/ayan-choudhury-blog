import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
  ],
  theme: {
    extend: {
      colors: {
        salmon_dark: "#e5775e",
        salmon_light: "#ffa07b",
        terracotta: {
          50: "#fef8f7",
          100: "#fcf0ef",
          200: "#f8dad6",
          300: "#f3c4bd",
          400: "#ea988c",
          500: "#e16c5a",
          600: "#cb6151",
          700: "#a95144",
          800: "#874136",
          900: "#6e352c",
        },
      },
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
        serif: ["Sentient-Variable", ...defaultTheme.fontFamily.serif],
        // serif: ["Lora", ...defaultTheme.fontFamily.serif],
      },
    },
  },
  plugins: [require("@tailwindcss/typography"),
    function ({ addVariant }) {
      addVariant("child", "& > *");
      addVariant("child-hover", "& > *:hover");
    },
  ],
  
};
