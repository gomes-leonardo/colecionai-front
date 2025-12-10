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
      colors: {
        // Minimalist Light Theme
        background: '#FFFFFF',
        backgroundSecondary: '#F8F9FA',
        backgroundTertiary: '#F1F3F5',
        backgroundHover: '#FAFAFA',
        
        foreground: '#1A1A1A',
        textPrimary: '#1A1A1A',
        textSecondary: '#4A4A4A',
        textTertiary: '#6B7280',
        textMuted: '#9CA3AF',
        
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#1A1A1A',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#1A1A1A',
        },
        
        // Accent (azul desaturado)
        primary: {
          DEFAULT: '#5B7FFF',
          foreground: '#FFFFFF',
          hover: '#4A6FEE',
          light: '#EEF2FF',
          subtle: '#F5F7FF',
        },
        
        // Neutral (para botões principais)
        secondary: {
          DEFAULT: '#F1F3F5',
          foreground: '#1A1A1A',
          hover: '#E5E7EB',
        },
        
        neutral: {
          DEFAULT: '#1A1A1A',
          hover: '#2A2A2A',
          light: '#F5F5F5',
        },
        
        muted: {
          DEFAULT: '#F8F9FA',
          foreground: '#6B7280',
        },
        
        accent: {
          DEFAULT: '#5B7FFF',
          foreground: '#FFFFFF',
        },
        
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#FFFFFF',
          light: '#FEE2E2',
        },
        
        success: {
          DEFAULT: '#10B981',
          foreground: '#FFFFFF',
          light: '#D1FAE5',
        },
        
        warning: {
          DEFAULT: '#F59E0B',
          foreground: '#FFFFFF',
          light: '#FEF3C7',
        },
        
        info: {
          DEFAULT: '#3B82F6',
          foreground: '#FFFFFF',
          light: '#DBEAFE',
        },
        
        // Borders
        border: '#E5E5E5',
        borderLight: '#F0F0F0',
        borderMedium: '#DDDDDD',
        borderDark: '#CCCCCC',
        
        input: '#DDDDDD',
        ring: '#5B7FFF',
      },
      
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.03)',
        'none': 'none',
      },
      
      borderRadius: {
        lg: '0.5rem',    // 8px
        md: '0.375rem',  // 6px
        sm: '0.25rem',   // 4px
      },
      
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"SF Mono"', 'Monaco', '"Cascadia Code"', '"Roboto Mono"', 'Consolas', '"Courier New"', 'monospace'],
      },
      
      lineHeight: {
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '1.75',
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
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "slide-in-from-bottom": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-out",
        "slide-up": "slide-in-from-bottom 0.4s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "pulse-subtle": "pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

