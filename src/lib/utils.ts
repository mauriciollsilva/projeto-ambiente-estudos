import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isPast } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { SrsDifficulty } from '@/types'

// Combina classes do Tailwind de forma segura (remove conflitos)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formata data para exibição no padrão brasileiro
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

// Formata data apenas com dia/mês/ano
export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'dd/MM/yyyy', { locale: ptBR })
}

// Retorna tempo relativo (ex: "há 2 dias", "em 3 dias")
export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(d, { locale: ptBR, addSuffix: true })
}

// Traduz o valor de dificuldade para português
export function difficultyLabel(difficulty: string | null): string {
  const labels: Record<string, string> = {
    easy: 'Fácil',
    medium: 'Médio',
    hard: 'Difícil',
  }
  return labels[difficulty ?? ''] ?? 'Médio'
}

// Retorna classes Tailwind de cor baseadas na dificuldade
export function difficultyColor(difficulty: string | null): {
  bg: string
  text: string
  border: string
} {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    easy: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-300',
    },
    medium: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-300',
    },
    hard: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-300',
    },
  }
  return colors[difficulty ?? ''] ?? colors.medium
}

// Verifica se um item está vencido para revisão
export function isOverdue(nextReviewAt: Date | string): boolean {
  const d = typeof nextReviewAt === 'string' ? new Date(nextReviewAt) : nextReviewAt
  return isPast(d)
}

// Retorna label do tipo de conteúdo
export function typeLabel(type: string): string {
  return type === 'pdf' ? 'PDF' : 'Nota'
}

// Retorna a descrição do intervalo de revisão por dificuldade
export function difficultyInterval(difficulty: SrsDifficulty): string {
  const intervals: Record<SrsDifficulty, string> = {
    easy: '7 dias',
    medium: '2 dias',
    hard: '24 horas',
  }
  return intervals[difficulty]
}
