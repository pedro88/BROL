import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Palette VHS 80s Retro
      colors: {
        // Base - CRT noir profond
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        // Card
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Popover
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },

        // Primary - Magenta VHS
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },

        // Secondary - Cyan
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },

        // Accent - Jaune VHS
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },

        // Muted
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },

        // Destructive
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },

        // Border & Input
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        // Graph colors for charts
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },

      // Border radius avec style pixelisé
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      // Fonts
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
        display: ["var(--font-vt323)", "ui-monospace", "monospace"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
      },

      // Animations VHS
      keyframes: {
        // Scanline effect
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        // Glow pulse
        glow: {
          "0%, 100%": {
            boxShadow: "0 0 5px hsl(var(--primary)), 0 0 10px hsl(var(--primary)), 0 0 15px hsl(var(--primary))",
          },
          "50%": {
            boxShadow: "0 0 10px hsl(var(--primary)), 0 0 20px hsl(var(--primary)), 0 0 30px hsl(var(--primary))",
          },
        },
        // Flicker
        flicker: {
          "0%, 100%": { opacity: "1" },
          "92%": { opacity: "1" },
          "93%": { opacity: "0.8" },
          "94%": { opacity: "1" },
          "96%": { opacity: "0.9" },
          "97%": { opacity: "1" },
        },
        // Glitch
        glitch: {
          "0%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 2px)" },
          "40%": { transform: "translate(-2px, -2px)" },
          "60%": { transform: "translate(2px, 2px)" },
          "80%": { transform: "translate(2px, -2px)" },
          "100%": { transform: "translate(0)" },
        },
        // Typewriter cursor
        blink: {
          "0%, 50%": { opacity: "1" },
          "51%, 100%": { opacity: "0" },
        },
        // VHS tracking noise
        noise: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "10%": { transform: "translate(-1%, -1%)" },
          "20%": { transform: "translate(1%, 1%)" },
          "30%": { transform: "translate(-1%, 1%)" },
          "40%": { transform: "translate(1%, -1%)" },
          "50%": { transform: "translate(-1%, 0)" },
          "60%": { transform: "translate(1%, 0)" },
          "70%": { transform: "translate(0, 1%)" },
          "80%": { transform: "translate(0, -1%)" },
          "90%": { transform: "translate(-1%, 1%)" },
        },
      },

      animation: {
        scanline: "scanline 8s linear infinite",
        glow: "glow 2s ease-in-out infinite",
        flicker: "flicker 0.15s infinite",
        glitch: "glitch 0.3s ease-in-out infinite",
        blink: "blink 1s step-end infinite",
        noise: "noise 0.5s steps(10) infinite",
      },

      // Effets visuels
      backgroundImage: {
        // Gradient CRT
        "vhs-gradient": "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,255,255,0.03) 50%, rgba(0,0,0,0) 100%)",
        // Scanlines
        "scanlines": "repeating-linear-gradient(0deg, rgba(0,0,0,0.15), rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)",
        // Grid
        "grid": "linear-gradient(rgba(0,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.03) 1px, transparent 1px)",
      },

      backgroundSize: {
        "scanlines": "100% 2px",
        "grid": "50px 50px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
