import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { contentItems, reviewHistory } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { buildReviewUpdate, isValidDifficulty } from '@/lib/srs/scheduler'
import { formatDate } from '@/lib/utils'

type RouteParams = { params: { id: string } }

/**
 * POST /api/notes/[id]/review
 * Registra uma revisão SRS e agenda a próxima.
 *
 * Body: { difficulty: 'easy' | 'medium' | 'hard' }
 * Resposta: { success, nextReviewAt, difficulty }
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json()
    const { difficulty } = body

    // Valida dificuldade
    if (!isValidDifficulty(difficulty)) {
      return NextResponse.json(
        { error: 'Dificuldade inválida. Use: easy, medium ou hard' },
        { status: 400 }
      )
    }

    // Verifica se o item existe
    const [existing] = await db
      .select({ id: contentItems.id })
      .from(contentItems)
      .where(eq(contentItems.id, params.id))

    if (!existing) {
      return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
    }

    // Monta e aplica o update SRS (usando a lógica do scheduler)
    const updatePayload = buildReviewUpdate(difficulty)

    const [updated] = await db
      .update(contentItems)
      .set(updatePayload)
      .where(eq(contentItems.id, params.id))
      .returning()

    // Registra no histórico de revisões
    await db.insert(reviewHistory).values({
      contentItemId: params.id,
      difficulty,
      nextReviewAt: updated.nextReviewAt,
    })

    return NextResponse.json({
      success: true,
      nextReviewAt: updated.nextReviewAt.toISOString(),
      nextReviewFormatted: formatDate(updated.nextReviewAt),
      difficulty,
    })
  } catch (err) {
    console.error('Erro ao registrar revisão:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
