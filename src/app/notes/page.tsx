import Link from 'next/link'
import { NoteCard } from '@/components/notes/NoteCard'
import { Button } from '@/components/ui/Button'
import type { ContentItemWithDiscipline } from '@/types'

async function getAllNotes(): Promise<ContentItemWithDiscipline[]> {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const res = await fetch(`${appUrl}/api/notes`, { cache: 'no-store' })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export default async function NotesPage() {
  const notes = await getAllNotes()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Todas as Notas</h1>
          <p className="text-gray-500 text-sm mt-1">{notes.length} item(s) cadastrado(s)</p>
        </div>
        <div className="flex gap-2">
          <Link href="/pdfs/upload">
            <Button variant="outline" size="sm">📄 Upload PDF</Button>
          </Link>
          <Link href="/notes/new">
            <Button size="sm">✏️ Nova Nota</Button>
          </Link>
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">📝</p>
          <p className="text-lg font-semibold text-gray-700">Nenhuma nota ainda</p>
          <p className="text-gray-500 mt-2 mb-6">Crie sua primeira nota ou faça upload de um PDF</p>
          <Link href="/notes/new">
            <Button>Criar primeira nota</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {notes.map((note) => (
            <NoteCard key={note.id} item={note} />
          ))}
        </div>
      )}
    </div>
  )
}
