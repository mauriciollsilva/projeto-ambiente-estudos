import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { contentItems, disciplines } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

type RouteParams = { params: { id: string } }

// GET /api/notes/[id] — busca um item pelo ID (com nome da disciplina)
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const [item] = await db
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
      .where(eq(contentItems.id, params.id))

    if (!item) {
      return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (err) {
    console.error('Erro ao buscar nota:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// PUT /api/notes/[id] — atualiza título, corpo ou disciplina
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json()
    const { title, body: noteBody, disciplineId } = body

    if (title !== undefined && !title.trim()) {
      return NextResponse.json({ error: 'Título não pode ser vazio' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    if (title !== undefined) updateData.title = title.trim()
    if (noteBody !== undefined) updateData.body = noteBody
    if (disciplineId !== undefined) {
      updateData.disciplineId = disciplineId ? parseInt(disciplineId) : null
    }

    const [updated] = await db
      .update(contentItems)
      .set(updateData)
      .where(eq(contentItems.id, params.id))
      .returning()

    if (!updated) {
      return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (err) {
    console.error('Erro ao atualizar nota:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// DELETE /api/notes/[id] — remove o item e seu histórico (via cascade)
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const [deleted] = await db
      .delete(contentItems)
      .where(eq(contentItems.id, params.id))
      .returning()

    if (!deleted) {
      return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Erro ao deletar nota:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
