import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors
        primary: {
          DEFAULT: '#003428',
          light: '#04594A',
          dark: '#001E17',
        },
        // Accent colors
        accent: {
          1: '#38B69A',
          2: '#5AD7C2',
        },
        // Semantic colors
        danger: '#D84646',
        warning: '#F5B942',
        // Background colors
        background: {
          DEFAULT: '#F4FAF9',
          dark: '#001E17',
        },
        // Surface colors
        surface: {
          DEFAULT: '#E3F2EE',
          dark: '#003428',
        },
        // Border colors
        border: {
          DEFAULT: '#C5DED8',
          dark: '#04594A',
        },
        // Text colors
        text: {
          primary: {
            DEFAULT: '#1A2B28',
            dark: '#F4FAF9',
          },
          secondary: {
            DEFAULT: '#5A736E',
            dark: '#C5DED8',
          },
          disabled: {
            DEFAULT: '#B2C2BD',
            dark: '#5A736E',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
} satisfies Config