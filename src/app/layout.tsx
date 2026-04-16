'use client'

import './globals.css'
import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <html lang="pt-BR">
      <head>
        <title>SGAI — Gestão de Aprendizagem</title>
        <meta name="description" content="Sistema de Gestão de Aprendizagem com Repetição Espaçada" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {/* Header mobile */}
        <Header onMenuToggle={() => setSidebarOpen((o) => !o)} />

        {/* Sidebar (desktop fixo, mobile deslizante) */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Conteúdo principal com margem para o sidebar no desktop */}
        <main className="min-h-screen md:ml-64 pt-0 md:pt-0">
          <div className="max-w-5xl mx-auto px-4 py-6 md:px-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}
