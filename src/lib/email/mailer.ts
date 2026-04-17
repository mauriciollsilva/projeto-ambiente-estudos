import nodemailer from 'nodemailer'
import { difficultyLabel } from '@/lib/utils'
import type { ContentItemWithDiscipline } from '@/types'

let transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }
  return transporter
}

// Retorna a disciplina em destaque para o dia, rotacionando entre as disponíveis
function getDisciplinaDestaque(items: ContentItemWithDiscipline[]): string | null {
  const disciplines = [...new Set(items.map((i) => i.disciplineName).filter(Boolean))] as string[]
  if (disciplines.length === 0) return null
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  )
  return disciplines[dayOfYear % disciplines.length]
}

// Frases motivacionais jurídicas para variar a cada dia
const FRASES = [
  'O Direito é a arte do bem e da equidade. — Celso',
  'Onde a lei termina, começa a tirania. — John Locke',
  'A justiça sem a força é impotente. — Blaise Pascal',
  'Conhecer as leis não é ter em memória suas palavras, mas o seu poder. — Justiniano',
  'O bom advogado conhece a lei; o grande advogado conhece o juiz. — desconhecido',
  'Não basta saber — é preciso aplicar. Não basta querer — é preciso agir. — Goethe',
  'O estudo é a maior herança que um pai pode dar ao filho. — Provérbio',
]

function getFraseMotivacional(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  )
  return FRASES[dayOfYear % FRASES.length]
}

function formatarDataPtBR(): string {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function buildEmailHTML(items: ContentItemWithDiscipline[]): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const nomeDestinatario = process.env.ALERT_NOME ?? 'Estudante'
  const hardCount = items.filter((i) => i.difficulty === 'hard').length
  const disciplinaDestaque = getDisciplinaDestaque(items)
  const frase = getFraseMotivacional()
  const dataHoje = capitalize(formatarDataPtBR())

  // Agrupa por disciplina
  const grouped = items.reduce<Record<string, ContentItemWithDiscipline[]>>((acc, item) => {
    const key = item.disciplineName ?? 'Sem Disciplina'
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  const diffColors: Record<string, string> = {
    hard: '#dc2626',
    medium: '#d97706',
    easy: '#059669',
  }

  const diffBg: Record<string, string> = {
    hard: '#fef2f2',
    medium: '#fffbeb',
    easy: '#f0fdf4',
  }

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assistente de Estudos — Revisão Diária</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">

  <div style="max-width:620px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- HEADER -->
    <div style="background:linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 60%,#2563eb 100%);padding:40px 36px 32px;">
      <div style="display:flex;align-items:center;margin-bottom:20px;">
        <span style="font-size:28px;margin-right:10px;">⚖️</span>
        <span style="color:#bfdbfe;font-size:13px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">Assistente de Estudos</span>
      </div>
      <h1 style="margin:0 0 8px;color:#ffffff;font-size:26px;font-weight:700;line-height:1.2;">
        Bom dia, ${nomeDestinatario}! ☀️
      </h1>
      <p style="margin:0;color:#bfdbfe;font-size:14px;">${dataHoje}</p>
    </div>

    <!-- FRASE MOTIVACIONAL -->
    <div style="background:#eff6ff;border-left:4px solid #2563eb;margin:0;padding:18px 36px;">
      <p style="margin:0;color:#1e40af;font-size:13px;font-style:italic;line-height:1.6;">
        "${frase}"
      </p>
    </div>

    <div style="padding:28px 36px;">

      <!-- RESUMO DO DIA -->
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:28px;">
        <h2 style="margin:0 0 16px;color:#0f172a;font-size:15px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">
          📊 Resumo de Hoje
        </h2>
        <div style="display:flex;gap:12px;flex-wrap:wrap;">
          <div style="flex:1;min-width:120px;background:#dbeafe;border-radius:10px;padding:14px;text-align:center;">
            <div style="font-size:28px;font-weight:800;color:#1d4ed8;">${items.length}</div>
            <div style="font-size:11px;color:#1e40af;font-weight:600;margin-top:2px;">Para Revisar</div>
          </div>
          <div style="flex:1;min-width:120px;background:${hardCount > 0 ? '#fee2e2' : '#dcfce7'};border-radius:10px;padding:14px;text-align:center;">
            <div style="font-size:28px;font-weight:800;color:${hardCount > 0 ? '#dc2626' : '#16a34a'};">${hardCount}</div>
            <div style="font-size:11px;color:${hardCount > 0 ? '#991b1b' : '#15803d'};font-weight:600;margin-top:2px;">Urgentes</div>
          </div>
          <div style="flex:1;min-width:120px;background:#f0fdf4;border-radius:10px;padding:14px;text-align:center;">
            <div style="font-size:28px;font-weight:800;color:#16a34a;">${items.length - hardCount}</div>
            <div style="font-size:11px;color:#15803d;font-weight:600;margin-top:2px;">Tranquilos</div>
          </div>
        </div>
      </div>

      ${disciplinaDestaque ? `
      <!-- DISCIPLINA EM DESTAQUE -->
      <div style="background:linear-gradient(135deg,#fef3c7,#fde68a);border:1px solid #f59e0b;border-radius:12px;padding:18px 20px;margin-bottom:28px;">
        <div style="font-size:11px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">
          ⭐ Disciplina em Destaque Hoje
        </div>
        <div style="font-size:18px;font-weight:700;color:#78350f;">${disciplinaDestaque}</div>
        <div style="font-size:12px;color:#92400e;margin-top:4px;">
          ${(grouped[disciplinaDestaque] ?? []).length} item(s) aguardando revisão
        </div>
      </div>
      ` : ''}

      ${hardCount > 0 ? `
      <!-- ALERTA URGENTE -->
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px 20px;margin-bottom:28px;">
        <p style="margin:0;font-size:13px;color:#991b1b;font-weight:600;">
          ⚠️ Você tem ${hardCount} item(s) marcado(s) como <strong>Difícil</strong> que precisam de atenção prioritária hoje!
        </p>
      </div>
      ` : ''}

      <!-- ITENS POR DISCIPLINA -->
      ${Object.entries(grouped).map(([disciplina, disciplinaItems]) => `
      <div style="margin-bottom:28px;">
        <h3 style="margin:0 0 12px;font-size:14px;font-weight:700;color:#1e293b;padding-bottom:8px;border-bottom:2px solid #e2e8f0;display:flex;align-items:center;gap:8px;">
          📚 ${disciplina}
          <span style="background:#e2e8f0;color:#64748b;font-size:11px;padding:2px 8px;border-radius:20px;font-weight:600;">${disciplinaItems.length}</span>
        </h3>
        ${disciplinaItems.map((item) => `
        <div style="background:${diffBg[item.difficulty ?? 'medium']};border:1px solid ${diffColors[item.difficulty ?? 'medium']}33;border-left:4px solid ${diffColors[item.difficulty ?? 'medium']};border-radius:8px;padding:12px 14px;margin-bottom:8px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
            <div style="flex:1;">
              <div style="font-size:14px;font-weight:600;color:#0f172a;margin-bottom:4px;">${item.title}</div>
              <div style="font-size:11px;color:#64748b;">
                ${item.type === 'pdf' ? '📄 PDF' : '📝 Nota'}
              </div>
            </div>
            <span style="background:${diffColors[item.difficulty ?? 'medium']};color:#fff;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;white-space:nowrap;">
              ${difficultyLabel(item.difficulty)}
            </span>
          </div>
        </div>
        `).join('')}
      </div>
      `).join('')}

      <!-- BOTÃO CTA -->
      <div style="text-align:center;margin:32px 0 8px;">
        <a href="${appUrl}" style="display:inline-block;background:linear-gradient(135deg,#1d4ed8,#2563eb);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:50px;font-size:16px;font-weight:700;letter-spacing:0.5px;box-shadow:0 4px 14px rgba(37,99,235,0.4);">
          Iniciar Revisão Agora →
        </a>
      </div>

      <p style="text-align:center;font-size:12px;color:#94a3b8;margin-top:16px;">
        Consistência é a chave do aprendizado. Bons estudos! 🎯
      </p>

    </div>

    <!-- FOOTER -->
    <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 36px;text-align:center;">
      <p style="margin:0 0 6px;font-size:12px;color:#64748b;font-weight:600;">Assistente de Estudos · Sistema de Revisão Espaçada</p>
      <p style="margin:0;font-size:11px;color:#94a3b8;">
        Este e-mail foi enviado automaticamente às 06:00 ·
        <a href="${appUrl}" style="color:#2563eb;text-decoration:none;">Acessar sistema</a>
      </p>
    </div>

  </div>

</body>
</html>`
}

export async function sendDailyAlert(
  items: ContentItemWithDiscipline[]
): Promise<{ success: boolean; error?: string }> {
  if (!process.env.SMTP_USER || !process.env.ALERT_EMAIL_TO) {
    console.warn('⚠️ SMTP não configurado. Pulando envio de e-mail.')
    return { success: false, error: 'SMTP não configurado' }
  }

  const nomeDestinatario = process.env.ALERT_NOME ?? 'Estudante'
  const hardCount = items.filter((i) => i.difficulty === 'hard').length
  const assunto = hardCount > 0
    ? `⚠️ ${nomeDestinatario}, você tem ${hardCount} item(s) urgente(s) para revisar hoje!`
    : `📚 ${nomeDestinatario}, sua revisão de hoje está pronta — ${items.length} item(s)`

  try {
    await getTransporter().sendMail({
      from: `"Assistente de Estudos" <${process.env.SMTP_USER}>`,
      to: process.env.ALERT_EMAIL_TO,
      subject: assunto,
      html: buildEmailHTML(items),
    })
    return { success: true }
  } catch (err) {
    console.error('Erro ao enviar e-mail:', err)
    return { success: false, error: String(err) }
  }
}
