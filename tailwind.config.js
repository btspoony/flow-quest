const defaultSans = [
  // English Fonts
  "Overpass",
  "Roboto",
  "'Helvetica Neue'",
  "Arial",
  "Helvetica",
  "'Noto Sans'",
  // Chinese Fonts, Mac/Win/Linux
  "'PingFang SC'",
  "'Microsoft Yahei'",
  "微软雅黑",
  "'WenQuanYi Micro Hei'",
  // System Fonts
  "system-ui",
  "-apple-system",
  "BlinkMacSystemFont",
  "'Segoe UI'",
  "sans-serif",
  // emoji fonts
  "'Apple Color Emoji'",
  "'Segoe UI Emoji'",
  "'Segoe UI Symbol'",
  "'Noto Color Emoji'",
];

module.exports = {
  darkMode: ["class", '[data-theme="dark"]'],
  corePlugins: {
    /* Avoid pico.css preflight conflict */
    preflight: false,
  },
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        failure: "rgb(var(--color-failure) / <alpha-value>)",
      },
      fontFamily: {
        sans: [...defaultSans],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
