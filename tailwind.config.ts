import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        surface: {
          app:     "#0b0f14",
          sidebar: "#0f1419",
          panel:   "#131a22",
          raised:  "#18212d",
          line:    "#1e2d3d",
        },
      },
      borderColor: {
        DEFAULT: "#1e2d3d",
      },
    },
  },
  plugins: [forms],
};

export default config;
