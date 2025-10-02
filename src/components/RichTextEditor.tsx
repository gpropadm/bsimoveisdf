'use client'

import { useRef } from 'react'
import { Editor } from '@tinymce/tinymce-react'

interface RichTextEditorProps {
  value: string
  onChange: (content: string) => void
  placeholder?: string
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<any>(null)

  return (
    <div className="rich-text-editor">
      <Editor
        apiKey="gv8vua7hmn7lkf6gdbqkfseoen4otbwecdbvwgtdo71auy4o"
        onInit={(evt, editor) => editorRef.current = editor}
        value={value}
        onEditorChange={onChange}
        init={{
          height: 400,
          menubar: false,
          plugins: [
            'lists', 'link', 'code', 'table', 'paste', 'wordcount'
          ],
          toolbar: 'undo redo | formatselect | bold italic underline | alignleft aligncenter alignright | bullist numlist | link | removeformat | code',
          content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 14px }',
          placeholder: placeholder || 'Digite a descrição do imóvel...',
          branding: false,
          promotion: false
        }}
      />
    </div>
  )
}
