import forms from "@tailwindcss/forms";
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          app: "#0b0f14",
          sidebar: "#10161d",
          panel: "#121a22",
          raised: "#17212b",
          line: "#26313d"
        }
      }
    }
  },
  plugins: [forms]
};

export default config;
