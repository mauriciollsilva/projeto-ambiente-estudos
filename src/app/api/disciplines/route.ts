import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { disciplines } from '@/lib/db/schema'
import { asc } from 'drizzle-orm'

// GET /api/disciplines — lista todas as disciplinas para os selects do formulário
export async function GET() {
  try {
    const result = await db
      .select()
      .from(disciplines)
      .orderBy(asc(disciplines.name))

    return NextResponse.json(result)
  } catch (err) {
    console.error('Erro ao buscar disciplinas:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
