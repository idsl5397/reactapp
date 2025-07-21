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
  plugins: [daisyui, typography],
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
      {
        fantasydark: {
          "primary": "#A1C2F1",
          "primary-content": "#1A1A1A",
          "secondary": "#6FE0DC",
          "secondary-content": "#1A1A1A",
          "accent": "#FF7847",
          "accent-content": "#1A1A1A",
          "neutral": "#1E1E1E",
          "neutral-content": "#F3F3F3",
          "base-100": "#1A1A1A",
          "base-200": "#2A2A2A",
          "base-300": "#3A3A3A",
          "base-content": "#F3F3F1",
          "info": "#66C7D9",
          "info-content": "#001C1C",
          "success": "#4793AF",
          "success-content": "#E6FAFF",
          "warning": "#FFD666",
          "warning-content": "#2A2A00",
          "error": "#FF6B6B",
          "error-content": "#1A0000",
        },
      },
    ],
    darkTheme: "fantasydark", // 🌙 深色模式自動切換主題
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: true,
    themeRoot: ":root",
  },
} satisfies Config;