import type { Config } from 'tailwindcss';

export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        maroon: {
          50: '#f5e5e5',
          100: '#e6b8b8',
          200: '#d68a8a',
          300: '#c65c5c',
          400: '#b62e2e',
          500: '#a60000', // Dark Maroon
          600: '#950000',
          700: '#850000',
          800: '#740000',
          900: '#630000',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
