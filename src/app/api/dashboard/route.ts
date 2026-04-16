import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { contentItems, disciplines } from '@/lib/db/schema'
import { lte, eq } from 'drizzle-orm'
import { prioritizeDueItems } from '@/lib/srs/scheduler'
import type { DashboardResponse } from '@/types'

/**
 * GET /api/dashboard
 * Retorna itens com next_review_at <= agora, priorizando "Difícil".
 * É a fonte de dados da tela inicial.
 */
export async function GET() {
  try {
    const now = new Date()

    const items = await db
      .select({
        id: contentItems.id,
        title: contentItems.title,
        type: contentItems.type,
        body: contentItems.body,
        filePath: contentItems.filePath,
        extractedText: contentItems.extractedText,
        disciplineId: contentItems.disciplineId,
        disciplineName: disciplines.name,
        difficulty: contentItems.difficulty,
        reviewCount: contentItems.reviewCount,
        lastReviewedAt: contentItems.lastReviewedAt,
        nextReviewAt: contentItems.nextReviewAt,
        createdAt: contentItems.createdAt,
        updatedAt: contentItems.updatedAt,
      })
      .from(contentItems)
      .leftJoin(disciplines, eq(contentItems.disciplineId, disciplines.id))
      // Apenas itens vencidos para revisão
      .where(lte(contentItems.nextReviewAt, now))

    // Aplica a ordenação: Difícil primeiro, depois por data mais antiga
    const sorted = prioritizeDueItems(items)

    const response: DashboardResponse = {
      items: sorted,
      totalDue: sorted.length,
      hardCount: sorted.filter((i) => i.difficulty === 'hard').length,
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('Erro ao buscar dashboard:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
