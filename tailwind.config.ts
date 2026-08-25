import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#2B3A55',
        'navy-deep': '#1F2B40',
        cream: '#FBF3E7',
        'cream-dark': '#F3E6D3',
        gold: '#F4A259',
        'gold-deep': '#E08E3E',
        teal: '#5B9A8B',
        'teal-deep': '#457B6E',
        coral: '#E76F51',
        'text-dark': '#3D3D3D',
        'text-muted': '#7A7A7A',
      },
      fontFamily: {
        sans: ['맑은 고딕', 'Apple SD Gothic Neo', 'Pretendard', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
