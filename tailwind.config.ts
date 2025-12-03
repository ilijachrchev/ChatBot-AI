import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        cream: '#F5F5F5',
        gravel: '#4E4E4E',
        iridium: '#3F3F3F',
        orange: '#FFA947',
        peach: '#FFE0BD',
        platinum: '#E6E6E6',
        ghost: '#CDCDCD',
        grandis: '#FFC989',
        porcelain: '#F1F1F1',
        ironside: '#636363',
        
        blue: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',   
          600: '#2563EB',  
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',   
          950: '#0F172A',  
        },
        
        slate: {
          50: '#F8FAFC',   
          100: '#F1F5F9',
          200: '#E2E8F0',   
          300: '#CBD5E1',  
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1F2937',   
          900: '#111827',   
          950: '#0B1121',   
        },
        
        purple: {
          400: '#A78BFA',  
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
        },
        
        green: {
          500: '#22C55E',  
          600: '#16A34A',
        },
        
        rose: {
          500: '#F43F5E',
          600: '#E11D48',
        },
        
        amber: {
          500: '#F59E0B',
          600: '#D97706',
        },
        
        'auth-bg': '#0A0F1E',
        'auth-card': '#1A1F2E',
        
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))'
        },
      },
      
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        'card': '0 2px 8px -2px rgb(0 0 0 / 0.08), 0 6px 12px -2px rgb(0 0 0 / 0.04)',
        'card-hover': '0 8px 16px -4px rgb(0 0 0 / 0.12), 0 6px 12px -2px rgb(0 0 0 / 0.08)',
        'glow-blue': '0 0 20px rgb(59 130 246 / 0.4)',
        'glow-purple': '0 0 20px rgb(124 58 237 / 0.4)',
        'auth-glow': '0 0 50px rgba(59, 130, 246, 0.3)',
      },
      
      backgroundImage: {
        'auth-gradient': 'radial-gradient(ellipse at 50% 50%, transparent 0%, #0A0F1E 70%)',
      },
      
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'caret-blink': {
          '0%,70%,100%': { opacity: '1' },
          '20%,50%': { opacity: '0' }
        },
        'open-sidebar': {
          from: { width: '60px' },
          to: { width: '300px' }
        },
        'close-sidebar': {
          from: { width: '300px' },
          to: { width: '60px' }
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' }
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        'glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(-20px) translateX(10px)' }
        },
        'orb-float': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -30px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' }
        }
      },
      
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'caret-blink': 'caret-blink 1.25s ease-out infinite',
        'open-sidebar': 'open-sidebar 0.2s ease-out',
        'close-sidebar': 'close-sidebar 0.2s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'shimmer-slow': 'shimmer 3s infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'float': 'float linear infinite',
        'orb-float': 'orb-float 20s ease-in-out infinite',
      }
    }
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config

export default config