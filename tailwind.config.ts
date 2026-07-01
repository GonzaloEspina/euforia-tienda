import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        euforia: {
          dark: "#1c1f26",
          darker: "#14161b",
          gray: "#2d323c",
          muted: "#a8b0be",
          sky: "#3db8e8",
          "sky-light": "#6ecff5",
          "sky-dark": "#2a9fd4",
          accent: "#4fc3f7",
          surface: "#23272f",
          card: "#2a2f38",
        },
        travel: {
          bg: "#e8f4fb",
          "bg-soft": "#f4f9fd",
          ink: "#1e3a52",
          "ink-muted": "#5a7286",
        },
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      fontSize: {
        xs: ["0.875rem", { lineHeight: "1.4" }],
        sm: ["1rem", { lineHeight: "1.5" }],
        base: ["1.0625rem", { lineHeight: "1.55" }],
        lg: ["1.1875rem", { lineHeight: "1.45" }],
        xl: ["1.3125rem", { lineHeight: "1.35" }],
        "2xl": ["1.5rem", { lineHeight: "1.3" }],
        "3xl": ["1.875rem", { lineHeight: "1.25" }],
        "4xl": ["2.25rem", { lineHeight: "1.2" }],
        "5xl": ["3rem", { lineHeight: "1.15" }],
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(ellipse 90% 50% at 50% -5%, rgba(61,184,232,0.25), transparent), linear-gradient(180deg, #dbeefb 0%, #e8f4fb 45%, #f4f9fd 100%)",
        "card-shine":
          "linear-gradient(135deg, rgba(61,184,232,0.12) 0%, transparent 50%)",
      },
      boxShadow: {
        glow: "0 0 40px rgba(42, 159, 212, 0.2)",
        card: "0 10px 30px rgba(30, 58, 82, 0.08)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        shimmer: "shimmer 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
