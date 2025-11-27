import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'

const config: Config = {
  darkMode: ['class', 'class'],
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
				50: '#eff6ff',
				100: '#dbeafe',
				200: '#bfdbfe',
				300: '#93c5fd',
				400: '#60a5fa',
				500: '#3b82f6',  // Main primary blue
				600: '#2563eb',
				700: '#1d4ed8',
				800: '#1e40af',
				900: '#1e3a8a',
			},
			rose: {
				50: '#fff1f2',
				100: '#ffe4e6',
				200: '#fecdd3',
				300: '#fda4af',
				400: '#fb7185',
				500: '#f43f5e',  // Main accent red
				600: '#e11d48',
				700: '#be123c',
				800: '#9f1239',
				900: '#881337',
			},
			slate: {
				50: '#f8fafc',
				100: '#f1f5f9',
				200: '#e2e8f0',
				300: '#cbd5e1',
				400: '#94a3b8',
				500: '#64748b',
				600: '#475569',
				700: '#334155',
				800: '#1e293b',
				900: '#0f172a',
				950: '#020617',
			},


			emerald: {
				500: '#10b981',
				600: '#059669',
				700: '#047857',
			},

			amber: {
				500: '#f59e0b',
				600: '#d97706',
				700: '#b45309',
			},

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
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
		boxShadow: {
			'card': '0 2px 8px -2px rgb(0 0 0 / 0.08), 0 6px 12px -2px rgb(0 0 0 / 0.04)',
			'card-hover': '0 8px 16px -4px rgb(0 0 0 / 0.12), 0 6px 12px -2px rgb(0 0 0 / 0.08)',
			'subtle': '0 1px 3px 0 rgb(0 0 0 / 0.06)',
			'glow-blue': '0 0 20px rgb(59 130 246 / 0.3)',
			'glow-red': '0 0 20px rgb(244 63 94 / 0.3)',
		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'caret-blink': {
  				'0%,70%,100%': {
  					opacity: '1'
  				},
  				'20%,50%': {
  					opacity: '0'
  				}
  			},
  			'open-sidebar': {
  				from: {
  					width: '60px'
  				},
  				to: {
  					width: '300px'
  				}
  			},
  			'close-sidebar': {
  				from: {
  					width: '300px'
  				},
  				to: {
  					width: '60px'
  				}
  			},
  			'fade-in': {
  				from: {
  					opacity: '0'
  				},
  				to: {
  					opacity: '1'
  				}
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
  		}
  	}
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config

export default config