'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { NoteEditor } from '@/components/notes/NoteEditor'
import { Button } from '@/components/ui/Button'
import type { Discipline } from '@/types'

export default function NewNotePage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [disciplineId, setDisciplineId] = useState('')
  const [disciplines, setDisciplines] = useState<Discipline[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Carrega disciplinas para o select
  useEffect(() => {
    fetch('/api/disciplines')
      .then((r) => r.json())
      .then(setDisciplines)
      .catch(console.error)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError('O título é obrigatório')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, disciplineId: disciplineId || null }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Erro ao criar nota')
      }

      const note = await res.json()
      router.push(`/notes/${note.id}`)
    } catch (err) {
      setError(String(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nova Nota</h1>
        <p className="text-gray-500 text-sm mt-1">Escreva em Markdown com suporte a tabelas, listas e mais</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Princípios do Direito Civil"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Disciplina */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Disciplina
          </label>
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

        {/* Editor Markdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Conteúdo (Markdown)
          </label>
          <NoteEditor
            value={body}
            onChange={setBody}
            placeholder="# Título&#10;&#10;Escreva sua nota aqui..."
          />
        </div>

        {/* Ações */}
        <div className="flex gap-3 pt-2">
          <Button type="submit" isLoading={isSubmitting}>
            Salvar Nota
          </Button>
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
