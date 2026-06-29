// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // === PRIMARY PALETTE (Brand Book §05) ===
        sambuca: {
          DEFAULT: "#3C2415",   // Pantone 4625C — logo wordmark, outlines
          light: "#5a3a22",
        },
        "mexican-red": {
          DEFAULT: "#AC1F25",   // Pantone 7621C — icon fill, energy accent
          dark: "#8a181d",
        },
        "silver-chalice": {
          DEFAULT: "#A7A9AC",   // Pantone Cool Gray 6C — secondary text
        },
        // === SECONDARY — RESERVA LINE ===
        "soma-gold": {
          DEFAULT: "#B8960C",   // Pantone 7752C — RESERVA borders, wordmark
          dark: "#8B6914",      // Pantone 7758C — all-gold typography
        },
        "negro-profundo": {
          DEFAULT: "#0D0D0D",   // K100 — RESERVA packaging background
        },
        // === UTILITY ===
        cream: {
          DEFAULT: "#FDF8F0",   // RESERVA editorial, campaign backgrounds
        },
      },
      fontFamily: {
        // Standard line — geometric rounded sans
        sans: ["var(--font-nunito)", "Poppins", "DM Sans", "system-ui"],
        // RESERVA line — elegant serif
        serif: ["var(--font-playfair)", "Cormorant Garamond", "Georgia"],
        // Retail / data — high legibility
        mono: ["Inter", "Barlow", "monospace"],
      },
      letterSpacing: {
        // Brand Book §06 — tracking values
        brand: "0.1em",     // SOMA MEAT wordmark (+100)
        cut: "0.06em",      // Cut names (+60)
      },
    },
  },
  plugins: [],
};

export default config;