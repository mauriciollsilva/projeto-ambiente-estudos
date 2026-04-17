import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { contentItems, disciplines } from '@/lib/db/schema'
import { lt, eq } from 'drizzle-orm'
import { sendDailyAlert } from '@/lib/email/mailer'

/**
 * GET /api/cron/daily-alert
 * Endpoint de cron protegido por CRON_SECRET.
 * Verifica itens vencidos e envia e-mail de resumo.
 *
 * Para agendar no Vercel, adicione ao vercel.json:
 * { "crons": [{ "path": "/api/cron/daily-alert", "schedule": "0 8 * * *" }] }
 *
 * Para Docker/auto-hospedagem, use crontab:
 * 0 8 * * * curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/daily-alert
 */
export async function GET(request: NextRequest) {
  // Autenticação via Bearer token
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const now = new Date()

    // Busca todos os itens com revisão vencida
    const overdueItems = await db
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
      .where(lt(contentItems.nextReviewAt, now))

    if (overdueItems.length === 0) {
      return NextResponse.json({ sent: false, message: 'Nenhum item vencido' })
    }

    const result = await sendDailyAlert(overdueItems)

    return NextResponse.json({
      sent: result.success,
      count: overdueItems.length,
      error: result.error,
    })
  } catch (err) {
    console.error('Erro no cron de alerta:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
