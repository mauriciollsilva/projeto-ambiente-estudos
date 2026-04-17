import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { contentItems } from '@/lib/db/schema'
import { extractPdfText } from '@/lib/pdf/parser'
import fs from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB

// POST /api/pdfs — faz upload de um PDF e extrai o texto para revisão
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const file = formData.get('file') as File | null
    const title = formData.get('title') as string | null
    const disciplineId = formData.get('disciplineId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'Arquivo é obrigatório' }, { status: 400 })
    }

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Título é obrigatório' }, { status: 400 })
    }

    // Valida tipo MIME
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Apenas arquivos PDF são aceitos' },
        { status: 400 }
      )
    }

    // Valida tamanho
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo: 50 MB' },
        { status: 400 }
      )
    }

    // Cria diretório de uploads se não existir
    const uploadDir = process.env.UPLOAD_DIR ?? '/tmp/uploads'
    await fs.mkdir(uploadDir, { recursive: true })

    // Salva o arquivo no disco com nome único
    const fileName = `${randomUUID()}.pdf`
    const filePath = path.join(uploadDir, fileName)

    const arrayBuffer = await file.arrayBuffer()
    await fs.writeFile(filePath, Buffer.from(arrayBuffer))

    // Extrai texto do PDF (armazenado para leitura sem re-parse)
    const extractedText = await extractPdfText(filePath)

    // Persiste no banco de dados
    const [newItem] = await db
      .insert(contentItems)
      .values({
        title: title.trim(),
        type: 'pdf',
        filePath,
        extractedText,
        disciplineId: disciplineId ? parseInt(disciplineId) : null,
        nextReviewAt: new Date(),
      })
      .returning()

    return NextResponse.json(newItem, { status: 201 })
  } catch (err) {
    console.error('Erro no upload de PDF:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
