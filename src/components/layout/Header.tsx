'use client'

import Link from 'next/link'
import { useState } from 'react'

interface HeaderProps {
  onMenuToggle?: () => void
}

export function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <Link href="/" className="font-bold text-blue-700 text-lg tracking-tight">
        📚 SGAI
      </Link>
      <button
        onClick={onMenuToggle}
        className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
        aria-label="Abrir menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </header>
  )
}
