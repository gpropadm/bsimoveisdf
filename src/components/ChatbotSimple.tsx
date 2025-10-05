'use client'

import { useState, useRef, useEffect } from 'react'
import { FiMessageCircle, FiX, FiSend } from 'react-icons/fi'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatbotSimple() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Olá! 👋 Como posso ajudar você a encontrar o imóvel ideal?'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)

    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: userMessage }
    ]
    setMessages(newMessages)

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: messages
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessages(data.conversationHistory)
      } else {
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content: 'Desculpe, ocorreu um erro. Tente novamente em instantes.'
          }
        ])
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'Desculpe, ocorreu um erro de conexão. Tente novamente.'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Não mostrar em páginas admin
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
    return null
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-24 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110"
        style={{
          zIndex: 9999,
          backgroundColor: '#7162f0'
        }}
        aria-label="Abrir chat"
      >
        {isOpen ? <FiX size={24} /> : <FiMessageCircle size={24} />}
      </button>

      {isOpen && (
        <div
          className="fixed bottom-24 right-4 md:right-24 w-[90vw] md:w-96 h-[500px] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden border border-gray-200"
          style={{ zIndex: 9999 }}
        >
          <div className="p-4 flex items-center justify-between" style={{ backgroundColor: '#7162f0' }}>
            <div className="flex items-center gap-3">
              <img
                src="/atendente-avatar.jpg"
                alt="Atendente"
                className="w-10 h-10 rounded-full border-2 border-white"
              />
              <h3 className="font-semibold text-white">Atendimento</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors text-white"
            >
              <FiX size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}
              >
                {msg.role === 'assistant' && (
                  <img
                    src="/atendente-avatar.jpg"
                    alt="Atendente"
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                )}
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'text-white rounded-br-sm'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm'
                  }`}
                  style={msg.role === 'user' ? { backgroundColor: '#7162f0' } : {}}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start items-end gap-2">
                <img
                  src="/atendente-avatar.jpg"
                  alt="Atendente"
                  className="w-8 h-8 rounded-full flex-shrink-0"
                />
                <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg rounded-bl-none">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-sm text-gray-900"
                style={{ '--tw-ring-color': '#7162f0' } as React.CSSProperties}
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
                style={{ backgroundColor: loading || !input.trim() ? '#d1d5db' : '#7162f0' }}
              >
                <FiSend size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
