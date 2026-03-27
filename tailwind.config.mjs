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
				'accent-color': 'rgb(var(--color-accent))',
				'accent-color-fg': 'rgb(var(--color-accent-fg))',
				'accent-color-subtle': 'rgb(var(--color-accent-subtle))',
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
				background: 'rgb(var(--background))',
				foreground: 'rgb(var(--foreground))',
				card: {
					DEFAULT: 'rgb(var(--card))',
					foreground: 'rgb(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'rgb(var(--popover))',
					foreground: 'rgb(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'rgb(var(--primary))',
					foreground: 'rgb(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'rgb(var(--secondary))',
					foreground: 'rgb(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'rgb(var(--muted))',
					foreground: 'rgb(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'rgb(var(--accent))',
					foreground: 'rgb(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'rgb(var(--destructive))',
					foreground: 'rgb(var(--destructive-foreground))'
				},
				border: 'rgb(var(--border))',
				input: 'rgb(var(--input))',
				ring: 'rgb(var(--ring))',
				chart: {
					'1': 'rgb(var(--chart-1))',
					'2': 'rgb(var(--chart-2))',
					'3': 'rgb(var(--chart-3))',
					'4': 'rgb(var(--chart-4))',
					'5': 'rgb(var(--chart-5))'
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
