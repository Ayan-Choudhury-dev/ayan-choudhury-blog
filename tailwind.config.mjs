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
				'accent-color': 'rgb(var(--color-accent) / <alpha-value>)',
				'accent-color-fg': 'rgb(var(--color-accent-fg) / <alpha-value>)',
				'accent-color-subtle': 'rgb(var(--color-accent-subtle) / <alpha-value>)',
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
				background: 'rgb(var(--background) / <alpha-value>)',
				foreground: 'rgb(var(--foreground) / <alpha-value>)',
				card: {
					DEFAULT: 'rgb(var(--card) / <alpha-value>)',
					foreground: 'rgb(var(--card-foreground) / <alpha-value>)'
				},
				popover: {
					DEFAULT: 'rgb(var(--popover) / <alpha-value>)',
					foreground: 'rgb(var(--popover-foreground) / <alpha-value>)'
				},
				primary: {
					DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
					foreground: 'rgb(var(--primary-foreground) / <alpha-value>)'
				},
				secondary: {
					DEFAULT: 'rgb(var(--secondary) / <alpha-value>)',
					foreground: 'rgb(var(--secondary-foreground) / <alpha-value>)'
				},
				muted: {
					DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
					foreground: 'rgb(var(--muted-foreground) / <alpha-value>)'
				},
				accent: {
					DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
					foreground: 'rgb(var(--accent-foreground) / <alpha-value>)'
				},
				destructive: {
					DEFAULT: 'rgb(var(--destructive) / <alpha-value>)',
					foreground: 'rgb(var(--destructive-foreground) / <alpha-value>)'
				},
				border: 'rgb(var(--border) / <alpha-value>)',
				input: 'rgb(var(--input) / <alpha-value>)',
				ring: 'rgb(var(--ring) / <alpha-value>)',
				chart: {
					'1': 'rgb(var(--chart-1) / <alpha-value>)',
					'2': 'rgb(var(--chart-2) / <alpha-value>)',
					'3': 'rgb(var(--chart-3) / <alpha-value>)',
					'4': 'rgb(var(--chart-4) / <alpha-value>)',
					'5': 'rgb(var(--chart-5) / <alpha-value>)'
				}
			},
			fontFamily: {
				sans: [
					'Geist Variable',
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
