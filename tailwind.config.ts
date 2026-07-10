import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
      },
      borderRadius: { xl: "var(--radius-xl)", lg: "var(--radius-lg)", md: "var(--radius-md)" },
      boxShadow: { soft: "0 10px 30px -18px rgb(88 39 52 / 0.35)", sheet: "0 -16px 44px -28px rgb(36 20 27 / 0.45)" },
      fontFamily: { sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"], serif: ["var(--font-serif)", "Georgia", "serif"] },
      keyframes: {
        sheetUp: { from: { transform: "translateY(100%)" }, to: { transform: "translateY(0)" } },
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        floatHeart: {
          "0%": { transform: "translateY(0) scale(.8)", opacity: "0" },
          "15%": { opacity: "1" },
          "100%": { transform: "translateY(-280px) scale(1.2) rotate(var(--rot, 0deg))", opacity: "0" }
        },
        burstSparkle: {
          "0%": { transform: "translate(0, 0) scale(0)", opacity: "0" },
          "20%": { opacity: "1" },
          "100%": { transform: "translate(var(--tx, 0px), var(--ty, -100px)) scale(1.2) rotate(var(--rot, 0deg))", opacity: "0" }
        },
        driftBlossom: {
          "0%": { transform: "translateY(0) translateX(0) scale(0.8) rotate(0deg)", opacity: "0" },
          "15%": { opacity: "1" },
          "50%": { transform: "translateY(-100px) translateX(var(--sway, 20px)) scale(1.1) rotate(45deg)" },
          "100%": { transform: "translateY(-260px) translateX(calc(var(--sway, 20px) * -1)) scale(0.9) rotate(90deg)", opacity: "0" }
        },
        shimmer: { "100%": { transform: "translateX(100%)" } },
      },
      animation: {
        sheetUp: "sheetUp 220ms cubic-bezier(.2,.8,.2,1)",
        fadeIn: "fadeIn 180ms ease-out",
        floatHeart: "floatHeart 1000ms ease-out forwards",
        burstSparkle: "burstSparkle 900ms cubic-bezier(.1,.8,.3,1) forwards",
        driftBlossom: "driftBlossom 1200ms ease-in-out forwards",
        shimmer: "shimmer 1.4s infinite"
      },
    },
  },
  plugins: [],
};

export default config;
