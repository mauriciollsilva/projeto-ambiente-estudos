import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { contentItems, disciplines } from '@/lib/db/schema'
import { eq, ilike, and, type SQL } from 'drizzle-orm'

// GET /api/notes — lista conteúdos com filtros opcionais
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const disciplineId = searchParams.get('disciplineId')
    const type = searchParams.get('type')
    const search = searchParams.get('search')

    // Monta filtros dinamicamente
    const filters: SQL[] = []
    if (disciplineId) filters.push(eq(contentItems.disciplineId, parseInt(disciplineId)))
    if (type) filters.push(eq(contentItems.type, type))
    if (search) filters.push(ilike(contentItems.title, `%${search}%`))

    const result = await db
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
      .where(filters.length > 0 ? and(...filters) : undefined)
      .orderBy(contentItems.createdAt)

    return NextResponse.json(result)
  } catch (err) {
    console.error('Erro ao listar notas:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// POST /api/notes — cria uma nova nota Markdown
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, body: noteBody, disciplineId } = body

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Título é obrigatório' }, { status: 400 })
    }

    const [newItem] = await db
      .insert(contentItems)
      .values({
        title: title.trim(),
        body: noteBody ?? '',
        type: 'note',
        disciplineId: disciplineId ? parseInt(disciplineId) : null,
        // Nota aparece imediatamente no dashboard para primeira revisão
        nextReviewAt: new Date(),
      })
      .returning()

    return NextResponse.json(newItem, { status: 201 })
  } catch (err) {
    console.error('Erro ao criar nota:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
