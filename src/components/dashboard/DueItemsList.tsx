'use client'

import { useState, useMemo } from 'react'
import { NoteCard } from '@/components/notes/NoteCard'
import type { ContentItemWithDiscipline } from '@/types'

interface DueItemsListProps {
  items: ContentItemWithDiscipline[]
}

export function DueItemsList({ items }: DueItemsListProps) {
  const [filterDiscipline, setFilterDiscipline] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')

  // Lista única de disciplinas para o filtro
  const disciplines = useMemo(() => {
    const names = [...new Set(items.map((i) => i.disciplineName).filter(Boolean))]
    return names as string[]
  }, [items])

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchDiscipline =
        filterDiscipline === 'all' || item.disciplineName === filterDiscipline
      const matchType = filterType === 'all' || item.type === filterType
      return matchDiscipline && matchType
    })
  }, [items, filterDiscipline, filterType])

  // Separa urgentes (hard) do restante
  const hardItems = filtered.filter((i) => i.difficulty === 'hard')
  const otherItems = filtered.filter((i) => i.difficulty !== 'hard')

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-5xl mb-4">🎉</p>
        <p className="text-xl font-semibold text-gray-700">Tudo em dia!</p>
        <p className="text-gray-500 mt-2">Nenhum item para revisar agora. Bom trabalho!</p>
      </div>
    )
  }

  return (
    <div>
      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={filterDiscipline}
          onChange={(e) => setFilterDiscipline(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todas as disciplinas</option>
          {disciplines.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos os tipos</option>
          <option value="note">Notas</option>
          <option value="pdf">PDFs</option>
        </select>

        {(filterDiscipline !== 'all' || filterType !== 'all') && (
          <button
            onClick={() => { setFilterDiscipline('all'); setFilterType('all') }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Seção de urgentes */}
      {hardItems.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-red-700 uppercase tracking-wide mb-3 flex items-center gap-2">
            <span>⚠️</span> Urgentes ({hardItems.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {hardItems.map((item) => (
              <NoteCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Demais itens */}
      {otherItems.length > 0 && (
        <div>
          {hardItems.length > 0 && (
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Outros ({otherItems.length})
            </h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {otherItems.map((item) => (
              <NoteCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-center text-gray-500 py-8">Nenhum item com esses filtros.</p>
      )}
    </div>
  )
}
