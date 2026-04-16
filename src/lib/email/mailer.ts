import nodemailer from 'nodemailer'
import { formatDate, difficultyLabel } from '@/lib/utils'
import type { ContentItemWithDiscipline } from '@/types'

// Singleton do transporter do Nodemailer
let transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false, // true para porta 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }
  return transporter
}

/**
 * Envia o e-mail de resumo diário com os itens vencidos para revisão.
 * Agrupa por disciplina para melhor legibilidade.
 */
export async function sendDailyAlert(
  items: ContentItemWithDiscipline[]
): Promise<{ success: boolean; error?: string }> {
  if (!process.env.SMTP_USER || !process.env.ALERT_EMAIL_TO) {
    console.warn('⚠️ SMTP não configurado. Pulando envio de e-mail.')
    return { success: false, error: 'SMTP não configurado' }
  }

  // Agrupa itens por disciplina para o corpo do e-mail
  const grouped = items.reduce<Record<string, ContentItemWithDiscipline[]>>(
    (acc, item) => {
      const key = item.disciplineName ?? 'Sem Disciplina'
      if (!acc[key]) acc[key] = []
      acc[key].push(item)
      return acc
    },
    {}
  )

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const hardCount = items.filter((i) => i.difficulty === 'hard').length

  // Monta o corpo HTML do e-mail
  const htmlBody = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; }
        h1 { color: #1e40af; }
        h2 { color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        th { background: #f3f4f6; text-align: left; padding: 8px 12px; font-size: 13px; }
        td { padding: 8px 12px; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
        .hard { color: #dc2626; font-weight: bold; }
        .medium { color: #d97706; }
        .easy { color: #059669; }
        .cta { display: block; background: #1e40af; color: white; text-align: center;
               padding: 14px 28px; border-radius: 8px; text-decoration: none;
               margin: 24px auto; width: fit-content; font-size: 16px; }
        .summary { background: #eff6ff; border-left: 4px solid #1e40af;
                   padding: 12px 16px; margin-bottom: 24px; border-radius: 4px; }
      </style>
    </head>
    <body>
      <h1>📚 SGAI — Revisão Pendente</h1>
      <div class="summary">
        <strong>${items.length} item(s)</strong> aguardando revisão hoje
        ${hardCount > 0 ? ` · <span class="hard">⚠️ ${hardCount} urgente(s)</span>` : ''}
      </div>

      ${Object.entries(grouped)
        .map(
          ([discipline, disciplineItems]) => `
        <h2>${discipline} (${disciplineItems.length})</h2>
        <table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Tipo</th>
              <th>Dificuldade</th>
              <th>Vencimento</th>
            </tr>
          </thead>
          <tbody>
            ${disciplineItems
              .map(
                (item) => `
              <tr>
                <td>${item.title}</td>
                <td>${item.type === 'pdf' ? 'PDF' : 'Nota'}</td>
                <td class="${item.difficulty ?? 'medium'}">${difficultyLabel(item.difficulty)}</td>
                <td>${formatDate(item.nextReviewAt)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      `
        )
        .join('')}

      <a href="${appUrl}" class="cta">Ir para o Dashboard →</a>
      <p style="color:#9ca3af;font-size:12px;text-align:center;">
        Este e-mail foi gerado automaticamente pelo SGAI.
      </p>
    </body>
    </html>
  `

  try {
    await getTransporter().sendMail({
      from: `"SGAI" <${process.env.SMTP_USER}>`,
      to: process.env.ALERT_EMAIL_TO,
      subject: `SGAI — Revisão Pendente: ${items.length} item(s) para hoje`,
      html: htmlBody,
    })
    return { success: true }
  } catch (err) {
    console.error('Erro ao enviar e-mail:', err)
    return { success: false, error: String(err) }
  }
}
