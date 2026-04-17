'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { NoteEditor } from '@/components/notes/NoteEditor'
import { Button } from '@/components/ui/Button'
import type { Discipline, ContentItemWithDiscipline } from '@/types'

export default function EditNotePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [disciplineId, setDisciplineId] = useState('')
  const [disciplines, setDisciplines] = useState<Discipline[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Carrega o item e a lista de disciplinas em paralelo
  useEffect(() => {
    Promise.all([
      fetch(`/api/notes/${id}`).then((r) => r.json()),
      fetch('/api/disciplines').then((r) => r.json()),
    ])
      .then(([note, discs]: [ContentItemWithDiscipline, Discipline[]]) => {
        setTitle(note.title)
        setBody(note.body ?? '')
        setDisciplineId(note.disciplineId?.toString() ?? '')
        setDisciplines(discs)
      })
      .catch(() => router.push('/'))
      .finally(() => setLoading(false))
  }, [id, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError('O título é obrigatório')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, disciplineId: disciplineId || null }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Erro ao salvar')
      }

      router.push(`/notes/${id}`)
    } catch (err) {
      setError(String(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Editar Nota</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Disciplina</label>
          <select
            value={disciplineId}
            onChange={(e) => setDisciplineId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione uma disciplina...</option>
            {disciplines.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Conteúdo (Markdown)
          </label>
          <NoteEditor value={body} onChange={setBody} />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" isLoading={isSubmitting}>Salvar Alterações</Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
