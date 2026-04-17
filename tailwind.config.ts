import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Tipografia confortável para leitura de textos longos
      fontSize: {
        reading: ['1.125rem', { lineHeight: '1.85' }],
      },
      maxWidth: {
        reading: '72ch',
      },
    },
  },
  plugins: [
    // Plugin de tipografia para renderização de Markdown
    require('@tailwindcss/typography'),
  ],
}

export default config
