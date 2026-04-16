import type { NextConfig } from 'next'

const config: NextConfig = {
  // Necessário para o estágio de produção no Docker
  output: 'standalone',
  // Pacotes Node.js usados apenas no servidor (não compatíveis com edge runtime)
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'nodemailer', 'pg'],
  },
}

export default config
