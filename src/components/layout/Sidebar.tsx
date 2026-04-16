'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

const navItems = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/notes/new', label: 'Nova Nota', icon: '✏️' },
  { href: '/pdfs/upload', label: 'Upload PDF', icon: '📄' },
  { href: '/notes', label: 'Todas as Notas', icon: '📚' },
]

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-gray-200',
          'flex flex-col transition-transform duration-200',
          // No mobile: slide in/out; no desktop: sempre visível
          'md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2" onClick={onClose}>
            <span className="text-2xl">📚</span>
            <div>
              <p className="font-bold text-blue-700 text-base leading-tight">SGAI</p>
              <p className="text-[10px] text-gray-400 leading-tight">Gestão de Aprendizagem</p>
            </div>
          </Link>
        </div>

        {/* Navegação */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Rodapé */}
        <div className="px-6 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">Repetição Espaçada · SRS</p>
        </div>
      </aside>
    </>
  )
}
