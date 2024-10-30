import type { Config } from "tailwindcss";
import { withUt } from "uploadthing/tw";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
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
        // Halloween animations
        ripple: {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2)', opacity: '0' }
        },
        'float-up': {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '1' },
          '100%': { transform: 'translateY(-100px) scale(1.5)', opacity: '0' },
        },
        'float-up-right': {
          '0%': { transform: 'translate(0, 0) scale(1)', opacity: '1' },
          '100%': { transform: 'translate(50px, -100px) scale(1.5)', opacity: '0' },
        },
        'float-up-left': {
          '0%': { transform: 'translate(0, 0) scale(1)', opacity: '1' },
          '100%': { transform: 'translate(-50px, -100px) scale(1.5)', opacity: '0' },
        },
        'float-random': {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '33%': { transform: 'translate(10px, -10px) rotate(10deg)' },
          '66%': { transform: 'translate(-10px, 10px) rotate(-10deg)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        shake: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '25%': { transform: 'translate(5px, 5px) rotate(5deg)' },
          '75%': { transform: 'translate(-5px, 5px) rotate(-5deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'spider-crawl': {
          '0%': { transform: 'translate(0, 0) rotate(0deg)' },
          '25%': { transform: 'translate(100%, 0) rotate(90deg)' },
          '50%': { transform: 'translate(100%, 100%) rotate(180deg)' },
          '75%': { transform: 'translate(0, 100%) rotate(270deg)' },
          '100%': { transform: 'translate(0, 0) rotate(360deg)' }
        },
        'ghost-float': {
          '0%, 100%': { transform: 'translateY(0) rotate(-5deg)' },
          '50%': { transform: 'translateY(-20px) rotate(5deg)' },
        },
        'pumpkin-pulse': {
          '0%, 100%': { transform: 'scale(1)', filter: 'brightness(100%)' },
          '50%': { transform: 'scale(1.05)', filter: 'brightness(110%)' },
        },
        'bat-fly': {
          '0%': { transform: 'translate(0, 0) rotate(0deg) scaleX(1)' },
          '25%': { transform: 'translate(25px, -15px) rotate(15deg) scaleX(0.8)' },
          '50%': { transform: 'translate(50px, 0) rotate(0deg) scaleX(1)' },
          '75%': { transform: 'translate(25px, 15px) rotate(-15deg) scaleX(0.8)' },
          '100%': { transform: 'translate(0, 0) rotate(0deg) scaleX(1)' },
        },
        'web-appear': {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '50%': { opacity: '0.5', transform: 'scale(1.1)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'candy-bounce': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(180deg)' },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        // Halloween animations
        'ripple': 'ripple 3s linear infinite',
        'float-up': 'float-up 2s ease-out forwards',
        'float-up-right': 'float-up-right 2s ease-out forwards',
        'float-up-left': 'float-up-left 2s ease-out forwards',
        'float-random': 'float-random 10s ease-in-out infinite',
        'wiggle': 'wiggle 0.3s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out infinite',
        'float': 'float 2s ease-in-out infinite',
        'spider-crawl': 'spider-crawl 20s linear infinite',
        'ghost-float': 'ghost-float 3s ease-in-out infinite',
        'pumpkin-pulse': 'pumpkin-pulse 2s ease-in-out infinite',
        'bat-fly': 'bat-fly 6s ease-in-out infinite',
        'web-appear': 'web-appear 1s ease-out forwards',
        'candy-bounce': 'candy-bounce 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default withUt(config);