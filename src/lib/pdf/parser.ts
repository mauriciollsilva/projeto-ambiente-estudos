import fs from 'fs/promises'

// Limite de caracteres do texto extraído para evitar overflow no banco
const MAX_TEXT_LENGTH = 100_000

/**
 * Extrai texto de um arquivo PDF no disco.
 * O texto é armazenado na coluna extracted_text para exibição na leitura.
 *
 * @param filePath - Caminho absoluto do arquivo PDF
 * @returns Texto extraído (truncado em 100k caracteres)
 */
export async function extractPdfText(filePath: string): Promise<string> {
  try {
    // Importação dinâmica para evitar problemas com o bundler do Next.js
    const pdfParse = (await import('pdf-parse')).default
    const dataBuffer = await fs.readFile(filePath)
    const data = await pdfParse(dataBuffer)
    return data.text.slice(0, MAX_TEXT_LENGTH)
  } catch (err) {
    console.error('Erro ao extrair texto do PDF:', err)
    return '[Não foi possível extrair o texto deste PDF]'
  }
}

/**
 * Valida se um arquivo é um PDF por seu magic number (bytes iniciais).
 */
export async function isPdfFile(filePath: string): Promise<boolean> {
  try {
    const buffer = Buffer.alloc(4)
    const fh = await fs.open(filePath, 'r')
    await fh.read(buffer, 0, 4, 0)
    await fh.close()
    // PDFs começam com "%PDF"
    return buffer.toString('ascii') === '%PDF'
  } catch {
    return false
  }
}
