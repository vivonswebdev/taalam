import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ["Outfit", "sans-serif"],
        arabic: ["Amiri", "serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        gold: {
          DEFAULT: "hsl(var(--gold))",
          foreground: "hsl(var(--gold-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        pearl: {
          DEFAULT: "hsl(var(--pearl))",
        },
        moonlight: {
          DEFAULT: "hsl(var(--moonlight))",
        },
        desert: {
          DEFAULT: "hsl(var(--desert))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        // ═══ ANIMATIONS SPIRITUELLES 2026 ═══
        "gentle-pulse": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(0.98)" },
        },
        breathe: {
          "0%, 100%": { 
            transform: "scale(1)", 
            boxShadow: "0 0 0 0 hsl(var(--primary) / 0.2)" 
          },
          "50%": { 
            transform: "scale(1.02)", 
            boxShadow: "0 0 0 10px hsl(var(--primary) / 0)" 
          },
        },
        "card-shimmer": {
          "0%": { transform: "translateX(-100%) rotate(25deg)" },
          "100%": { transform: "translateX(100%) rotate(25deg)" },
        },
        "star-twinkle": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "0.95" },
        },
        "light-shimmer": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
        "waterfall-drift": {
          "0%": { backgroundPosition: "0 0, 50px 0, 100px 0, 150px 0, 200px 0, 30px 0" },
          "100%": { backgroundPosition: "0 300px, 50px 350px, 100px 280px, 150px 320px, 200px 290px, 30px 310px" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out forwards",
        shimmer: "shimmer 2s linear infinite",
        // ═══ ANIMATIONS SPIRITUELLES 2026 ═══
        "pulse-gentle": "gentle-pulse 3s ease-in-out infinite",
        breathe: "breathe 2s ease-in-out infinite",
        "card-shimmer": "card-shimmer 0.8s ease-out forwards",
        "star-twinkle": "star-twinkle 6s ease-in-out infinite alternate",
        "light-shimmer": "light-shimmer 10s ease-in-out infinite alternate",
        "waterfall-drift": "waterfall-drift 8s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
