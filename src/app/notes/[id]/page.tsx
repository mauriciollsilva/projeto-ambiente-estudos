'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { SrsButtons } from '@/components/notes/SrsButtons'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import {
  difficultyLabel,
  formatDate,
  formatRelativeDate,
  typeLabel,
} from '@/lib/utils'
import type { ContentItemWithDiscipline, SrsDifficulty } from '@/types'

export default function NoteReadPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [item, setItem] = useState<ContentItemWithDiscipline | null>(null)
  const [loading, setLoading] = useState(true)
  const [reviewing, setReviewing] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/notes/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('Não encontrado')
        return r.json()
      })
      .then(setItem)
      .catch(() => router.push('/'))
      .finally(() => setLoading(false))
  }, [id, router])

  // Registra revisão SRS e redireciona para o dashboard
  async function handleReview(difficulty: SrsDifficulty) {
    setReviewing(true)
    try {
      const res = await fetch(`/api/notes/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty }),
      })
      const data = await res.json()
      setToast(`✅ Revisão registrada! Próxima: ${data.nextReviewFormatted}`)
      // Aguarda 1.5s para o usuário ler o feedback antes de redirecionar
      setTimeout(() => router.push('/'), 1500)
    } catch {
      setToast('❌ Erro ao registrar revisão')
      setReviewing(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Tem certeza que deseja excluir esta nota?')) return
    await fetch(`/api/notes/${id}`, { method: 'DELETE' })
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!item) return null

  return (
    <div className="max-w-3xl pb-32">
      {/* Navegação */}
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:text-blue-600">Dashboard</Link>
        <span>/</span>
        <span className="text-gray-900 truncate">{item.title}</span>
      </div>

      {/* Cabeçalho do item */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge label={typeLabel(item.type)} variant={item.type === 'pdf' ? 'pdf' : 'note'} />
          {item.difficulty && (
            <Badge
              label={difficultyLabel(item.difficulty)}
              variant={item.difficulty as 'easy' | 'medium' | 'hard'}
            />
          )}
          {item.disciplineName && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {item.disciplineName}
            </span>
          )}
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-3">
          {item.title}
        </h1>

        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
          <span>📅 Próxima revisão: {formatDate(item.nextReviewAt)}</span>
          <span>🔄 Revisado {item.reviewCount}× vezes</span>
          {item.lastReviewedAt && (
            <span>⏱ Última revisão: {formatRelativeDate(item.lastReviewedAt)}</span>
          )}
        </div>

        {/* Ações de edição */}
        <div className="flex gap-2 mt-4">
          <Link href={`/notes/${id}/edit`}>
            <Button variant="outline" size="sm">✏️ Editar</Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-600 hover:bg-red-50">
            🗑 Excluir
          </Button>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="reading-content">
        {item.type === 'note' && item.body ? (
          <div className="prose-reading">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {item.body}
            </ReactMarkdown>
          </div>
        ) : item.type === 'pdf' && item.extractedText ? (
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <p className="text-xs text-gray-400 mb-4 uppercase tracking-wide">Texto extraído do PDF</p>
            <pre className="whitespace-pre-wrap text-gray-800 text-sm leading-relaxed font-sans overflow-auto">
              {item.extractedText}
            </pre>
          </div>
        ) : (
          <p className="text-gray-400 italic">Nenhum conteúdo disponível.</p>
        )}
      </div>

      {/* Toast de feedback */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg text-sm animate-fade-in">
          {toast}
        </div>
      )}

      {/* Botões SRS fixados no fundo */}
      <SrsButtons itemId={id} onReview={handleReview} isLoading={reviewing} />
    </div>
  )
}
