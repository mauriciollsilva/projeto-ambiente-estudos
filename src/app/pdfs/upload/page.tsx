'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { Discipline } from '@/types'

const MAX_SIZE_MB = 50

export default function UploadPdfPage() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [disciplineId, setDisciplineId] = useState('')
  const [disciplines, setDisciplines] = useState<Discipline[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/disciplines')
      .then((r) => r.json())
      .then(setDisciplines)
      .catch(console.error)
  }, [])

  function handleFile(f: File) {
    if (f.type !== 'application/pdf') {
      setError('Apenas arquivos PDF são aceitos')
      return
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Arquivo muito grande. Máximo: ${MAX_SIZE_MB} MB`)
      return
    }
    setError('')
    setFile(f)
    // Pré-preenche o título com o nome do arquivo (sem extensão)
    if (!title) {
      setTitle(f.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' '))
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) { setError('Selecione um arquivo PDF'); return }
    if (!title.trim()) { setError('O título é obrigatório'); return }

    setIsSubmitting(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title.trim())
      if (disciplineId) formData.append('disciplineId', disciplineId)

      const res = await fetch('/api/pdfs', { method: 'POST', body: formData })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Erro no upload')
      }

      const newItem = await res.json()
      router.push(`/notes/${newItem.id}`)
    } catch (err) {
      setError(String(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Upload de PDF</h1>
        <p className="text-gray-500 text-sm mt-1">
          O texto será extraído automaticamente para revisão. Máximo: {MAX_SIZE_MB} MB
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Zona de drop */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors',
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : file
              ? 'border-green-400 bg-green-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          {file ? (
            <>
              <p className="text-4xl mb-2">📄</p>
              <p className="font-semibold text-green-700">{file.name}</p>
              <p className="text-sm text-gray-500 mt-1">
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setFile(null) }}
                className="mt-2 text-xs text-red-500 hover:text-red-700"
              >
                Remover
              </button>
            </>
          ) : (
            <>
              <p className="text-4xl mb-2">📁</p>
              <p className="text-gray-600 font-medium">Arraste o PDF aqui</p>
              <p className="text-sm text-gray-400 mt-1">ou clique para selecionar</p>
            </>
          )}
        </div>

        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Apostila de Direito Civil"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Disciplina */}
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

        <div className="flex gap-3 pt-2">
          <Button type="submit" isLoading={isSubmitting} disabled={!file}>
            {isSubmitting ? 'Processando PDF...' : 'Fazer Upload'}
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isSubmitting}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
