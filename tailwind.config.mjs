import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ["class"],
	content: [
		"./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
	],
	theme: {
		extend: {
			colors: {
				'accent-color': 'var(--color-accent)',
				'accent-color-fg': 'var(--color-accent-fg)',
				'accent-color-subtle': 'var(--color-accent-subtle)',
				terracotta: {
					'50': '#fef8f7',
					'100': '#fcf0ef',
					'200': '#f8dad6',
					'300': '#f3c4bd',
					'400': '#ea988c',
					'500': '#e16c5a',
					'600': '#cb6151',
					'700': '#a95144',
					'800': '#874136',
					'900': '#6e352c'
				},
				background: 'var(--background)',
				foreground: 'var(--foreground)',
				card: {
					DEFAULT: 'var(--card)',
					foreground: 'var(--card-foreground)'
				},
				popover: {
					DEFAULT: 'var(--popover)',
					foreground: 'var(--popover-foreground)'
				},
				primary: {
					DEFAULT: 'var(--primary)',
					foreground: 'var(--primary-foreground)'
				},
				secondary: {
					DEFAULT: 'var(--secondary)',
					foreground: 'var(--secondary-foreground)'
				},
				muted: {
					DEFAULT: 'var(--muted)',
					foreground: 'var(--muted-foreground)'
				},
				accent: {
					DEFAULT: 'var(--accent)',
					foreground: 'var(--accent-foreground)'
				},
				destructive: {
					DEFAULT: 'var(--destructive)',
					foreground: 'var(--destructive-foreground)'
				},
				border: 'var(--border)',
				input: 'var(--input)',
				ring: 'var(--ring)',
				chart: {
					'1': 'var(--chart-1)',
					'2': 'var(--chart-2)',
					'3': 'var(--chart-3)',
					'4': 'var(--chart-4)',
					'5': 'var(--chart-5)'
				}
			},
			fontFamily: {
				sans: [
					'Inter Variable',
					...defaultTheme.fontFamily.sans
				],
				serif: [
					'Merriweather Variable',
					...defaultTheme.fontFamily.serif
				]
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			boxShadow: {
				'glow-accent': 'inset 0 0 12px rgba(225, 119, 102, 0.1), 0 0 12px rgba(225, 119, 102, 0.15)',
				'glow-white': 'inset 0 0 12px rgba(255, 255, 255, 0.1), 0 0 12px rgba(255, 255, 255, 0.1)',
			}
		}
	},
	plugins: [require("@tailwindcss/typography"),
	function ({ addVariant }) {
		addVariant("child", "& > *");
		addVariant("child-hover", "& > *:hover");
	},
	require("tailwindcss-animate")
	],

};
