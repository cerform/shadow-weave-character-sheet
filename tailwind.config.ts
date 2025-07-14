
import type { Config } from "tailwindcss";

export default {
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
        // D&D specific colors
        "dnd-gold": "hsl(var(--dnd-gold))",
        "dnd-red": "hsl(var(--dnd-red))",
        "dnd-green": "hsl(var(--dnd-green))",
        "dnd-blue": "hsl(var(--dnd-blue))",
        theme: {
          shadow: {
            primary: "#7f00ff",
            secondary: "#ff00ff",
          },
          fire: {
            primary: "#ff4400",
            secondary: "#ff8800",
          },
          nature: {
            primary: "#00ff44",
            secondary: "#44ff88",
          },
          arcane: {
            primary: "#00ffff",
            secondary: "#00ccff",
          },
        },
      },
      fontFamily: {
        philosopher: ['Philosopher', 'sans-serif'],
        cormorant: ['Cormorant', 'serif'],
        // D&D Fantasy Fonts
        'fantasy-title': ['Cinzel', 'serif'],
        'fantasy-heading': ['Cinzel', 'serif'], 
        'fantasy-body': ['MedievalSharp', 'cursive'],
        'creepy': ['Creepster', 'cursive'],
        'ancient': ['Uncial Antiqua', 'cursive']
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
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px 2px rgba(255, 204, 0, 0.5)' },
          '50%': { boxShadow: '0 0 10px 4px rgba(255, 204, 0, 0.7)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.03)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        magicBorder: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        },
        mysticalFlow: {
          '0%, 100%': { 
            transform: 'translateX(0) translateY(0) scale(1)',
            opacity: '0.3'
          },
          '33%': { 
            transform: 'translateX(-20px) translateY(-10px) scale(1.1)',
            opacity: '0.5'
          },
          '66%': { 
            transform: 'translateX(15px) translateY(20px) scale(0.9)',
            opacity: '0.4'
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'float': 'float 6s ease-in-out infinite',
        'breathe': 'breathe 8s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'magic-border': 'magicBorder 3s ease infinite',
        'mystical-flow': 'mysticalFlow 20s ease-in-out infinite'
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
