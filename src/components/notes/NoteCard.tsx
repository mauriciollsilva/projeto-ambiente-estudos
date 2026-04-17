import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import {
  difficultyLabel,
  formatRelativeDate,
  typeLabel,
  isOverdue,
  cn,
} from '@/lib/utils'
import type { ContentItemWithDiscipline } from '@/types'

interface NoteCardProps {
  item: ContentItemWithDiscipline
}

export function NoteCard({ item }: NoteCardProps) {
  const overdue = isOverdue(item.nextReviewAt)
  const isHard = item.difficulty === 'hard'

  return (
    <Link href={`/notes/${item.id}`} className="block group">
      <div
        className={cn(
          'rounded-xl border bg-white p-4 shadow-sm transition-all',
          'hover:shadow-md hover:border-blue-200 group-hover:-translate-y-0.5',
          // Destaque visual para itens difíceis
          isHard ? 'border-l-4 border-l-red-500 border-gray-200' : 'border-gray-200'
        )}
      >
        {/* Cabeçalho: tipo e dificuldade */}
        <div className="flex items-center gap-2 mb-2">
          <Badge
            label={typeLabel(item.type)}
            variant={item.type === 'pdf' ? 'pdf' : 'note'}
          />
          {item.difficulty && (
            <Badge
              label={difficultyLabel(item.difficulty)}
              variant={item.difficulty as 'easy' | 'medium' | 'hard'}
            />
          )}
          {overdue && isHard && (
            <span className="ml-auto text-xs font-semibold text-red-600">
              ⚠️ Urgente
            </span>
          )}
        </div>

        {/* Título */}
        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">
          {item.title}
        </h3>

        {/* Disciplina */}
        {item.disciplineName && (
          <p className="text-xs text-gray-500 mb-2">{item.disciplineName}</p>
        )}

        {/* Rodapé: data de revisão e contador */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <span className={cn('text-xs', overdue ? 'text-red-600 font-medium' : 'text-gray-500')}>
            {overdue ? '⏰ ' : '📅 '}
            {formatRelativeDate(item.nextReviewAt)}
          </span>
          {item.reviewCount > 0 && (
            <span className="text-xs text-gray-400">
              {item.reviewCount}× revisado
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
