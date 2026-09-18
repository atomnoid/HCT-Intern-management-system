import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        surface: {
          app:     "#090d12",
          sidebar: "#0c1017",
          panel:   "#111620",
          raised:  "#161d2a",
          line:    "rgba(255, 255, 255, 0.08)",
          subtle:  "rgba(255, 255, 255, 0.04)",
        },
      },
      borderColor: {
        DEFAULT: "rgba(255, 255, 255, 0.08)",
      },
    },
  },
  plugins: [forms],
};

export default config;

