'use client'

import dynamic from 'next/dynamic'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'

// Importação dinâmica para evitar SSR do editor (usa APIs do browser)
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

interface NoteEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function NoteEditor({ value, onChange, placeholder }: NoteEditorProps) {
  return (
    <div data-color-mode="light">
      <MDEditor
        value={value}
        onChange={(val) => onChange(val ?? '')}
        height={420}
        preview="live"
        textareaProps={{
          placeholder: placeholder ?? 'Escreva sua nota em Markdown...',
        }}
      />
    </div>
  )
}
