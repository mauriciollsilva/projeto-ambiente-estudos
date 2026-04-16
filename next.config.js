/** @type {import('next').NextConfig} */
const config = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'nodemailer', 'pg'],
  },
}

module.exports = config
