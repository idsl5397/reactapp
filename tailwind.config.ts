import type { Config } from "tailwindcss";
import daisyui from "daisyui";
import typography from "@tailwindcss/typography";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [daisyui,typography], // 確保 DaisyUI 插件正確引入
  daisyui: {
    themes: [
      {
        fantasy: {
          "primary": "#4062BB",
          "primary-content": "#F3F3F1",
          "secondary": "#28B5AD",
          "secondary-content": "#EBF2FA",
          "accent": "#EA5404",
          "accent-content": "#FFFFFF",
          "neutral": "#FFFFFF",
          "neutral-content": "#242C3A",
          "base-100": "#F3F6FA",
          "base-200": "#FCFCFC",
          "base-300": "#cad7f7",
          "base-content": "#292929",
          "info": "#C5E7E8",
          "info-content": "#234241",
          "success": "#7DB9DE",
          "success-content": "#00140e",
          "warning": "#FFC408",
          "warning-content": "#00140e",
          "error": "#952E27",
          "error-content": "#FFFFFF",
        },
      },
    ], // false: only light + dark | true: all themes | array: specific themes like this ["light", "dark", "cupcake"]
    darkTheme: "", // name of one of the included themes for dark mode
    base: true, // applies background color and foreground color for root element by default
    styled: true, // include daisyUI colors and design decisions for all components
    utils: true, // adds responsive and modifier utility classes
    prefix: "", // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
    logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
    themeRoot: ":root", // The element that receives theme color CSS variables
  },
} satisfies Config;

