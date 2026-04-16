import { sql } from 'drizzle-orm'
import type { SrsDifficulty } from '@/types'

// Intervalos de revisão em milissegundos
const INTERVALS_MS: Record<SrsDifficulty, number> = {
  easy: 7 * 24 * 60 * 60 * 1000,    // 7 dias
  medium: 2 * 24 * 60 * 60 * 1000,  // 2 dias
  hard: 24 * 60 * 60 * 1000,        // 24 horas
}

/**
 * Calcula a próxima data de revisão com base na dificuldade.
 * Função pura — sem efeitos colaterais, fácil de testar.
 *
 * @param difficulty - 'easy' | 'medium' | 'hard'
 * @param from - Data base (padrão: agora)
 * @returns Nova data para próxima revisão
 */
export function calculateNextReview(
  difficulty: SrsDifficulty,
  from: Date = new Date()
): Date {
  return new Date(from.getTime() + INTERVALS_MS[difficulty])
}

/**
 * Monta o payload de atualização para a tabela content_items
 * quando o usuário registra uma revisão.
 */
export function buildReviewUpdate(difficulty: SrsDifficulty) {
  const nextReviewAt = calculateNextReview(difficulty)
  return {
    difficulty,
    nextReviewAt,
    lastReviewedAt: new Date(),
    // Incrementa reviewCount diretamente no banco (thread-safe)
    reviewCount: sql`review_count + 1`,
    updatedAt: new Date(),
  }
}

/**
 * Ordena itens do dashboard:
 * 1. Difícil primeiro
 * 2. Depois por nextReviewAt crescente (mais atrasados primeiro)
 */
export function prioritizeDueItems<
  T extends { difficulty: string | null; nextReviewAt: Date }
>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.difficulty === 'hard' && b.difficulty !== 'hard') return -1
    if (b.difficulty === 'hard' && a.difficulty !== 'hard') return 1
    return new Date(a.nextReviewAt).getTime() - new Date(b.nextReviewAt).getTime()
  })
}

/**
 * Valida se o valor recebido é uma dificuldade válida.
 */
export function isValidDifficulty(value: unknown): value is SrsDifficulty {
  return value === 'easy' || value === 'medium' || value === 'hard'
}
