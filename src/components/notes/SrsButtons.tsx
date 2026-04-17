'use client'

import { Button } from '@/components/ui/Button'
import { difficultyInterval } from '@/lib/utils'
import type { SrsDifficulty } from '@/types'

interface SrsButtonsProps {
  itemId: string
  onReview: (difficulty: SrsDifficulty) => Promise<void>
  isLoading: boolean
}

const BUTTONS: { difficulty: SrsDifficulty; label: string; variant: 'danger' | 'warning' | 'success' }[] = [
  { difficulty: 'hard', label: 'Difícil', variant: 'danger' },
  { difficulty: 'medium', label: 'Médio', variant: 'warning' },
  { difficulty: 'easy', label: 'Fácil', variant: 'success' },
]

/**
 * Barra de botões SRS fixada no fundo da tela de leitura.
 * Ao clicar, registra a revisão e agenda a próxima.
 */
export function SrsButtons({ onReview, isLoading }: SrsButtonsProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg md:left-64">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <p className="text-center text-xs text-gray-500 mb-2">
          Como foi esta revisão?
        </p>
        <div className="flex gap-3 justify-center">
          {BUTTONS.map(({ difficulty, label, variant }) => (
            <button
              key={difficulty}
              onClick={() => onReview(difficulty)}
              disabled={isLoading}
              title={`Próxima revisão em ${difficultyInterval(difficulty)}`}
              className={`
                flex-1 max-w-[140px] flex flex-col items-center justify-center
                py-3 px-4 rounded-xl font-semibold text-sm transition-all
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-offset-2
                ${variant === 'danger'
                  ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
                  : variant === 'warning'
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-500'
                  : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
                }
              `}
            >
              <span className="text-base">{label}</span>
              <span className="text-[11px] opacity-80 mt-0.5">
                +{difficultyInterval(difficulty)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
