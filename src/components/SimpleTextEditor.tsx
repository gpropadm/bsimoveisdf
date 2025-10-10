'use client'

import { useState, useRef } from 'react'

interface SimpleTextEditorProps {
  value: string
  onChange: (content: string) => void
  placeholder?: string
}

export default function SimpleTextEditor({ value, onChange, placeholder }: SimpleTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertFormatting = (before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)

    onChange(newText)

    // Restaurar foco e seleção
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + before.length + selectedText.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex gap-1 flex-wrap">
        <button
          type="button"
          onClick={() => insertFormatting('**', '**')}
          className="px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 font-bold text-sm"
          title="Negrito"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => insertFormatting('*', '*')}
          className="px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 italic text-sm"
          title="Itálico"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => insertFormatting('\n• ')}
          className="px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm"
          title="Lista"
        >
          • Lista
        </button>
        <button
          type="button"
          onClick={() => insertFormatting('\n\n')}
          className="px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm"
          title="Parágrafo"
        >
          ¶
        </button>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Digite a descrição do imóvel...'}
        className="w-full p-4 min-h-[300px] focus:outline-none resize-y font-sans text-sm leading-relaxed"
        style={{ fontFamily: 'inherit' }}
      />

      {/* Preview hint */}
      <div className="bg-gray-50 border-t border-gray-300 px-4 py-2 text-xs text-gray-500">
        Dica: Use **texto** para negrito, *texto* para itálico
      </div>
    </div>
  )
}
