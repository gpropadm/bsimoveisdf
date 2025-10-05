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

  return (
    <div style={{ position: 'fixed', zIndex: 9999 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '96px',
          backgroundColor: '#7162f0',
          color: 'white',
          borderRadius: '9999px',
          padding: '16px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          border: 'none',
          cursor: 'pointer',
          transition: 'transform 0.3s',
          zIndex: 9999
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
        }}
        aria-label="Abrir chat"
      >
        {isOpen ? <FiX size={24} /> : <FiMessageCircle size={24} />}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '96px',
            right: '16px',
            width: '384px',
            maxWidth: '90vw',
            height: '500px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid #e5e7eb',
            zIndex: 9999
          }}
        >
          <div style={{
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#7162f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src="/atendente-avatar.jpg"
                alt="Atendente"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '9999px',
                  border: '2px solid white'
                }}
              />
              <h3 style={{ fontWeight: 600, color: 'white', margin: 0 }}>Atendimento</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <FiX size={20} />
            </button>
          </div>

          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            backgroundColor: '#f9fafb'
          }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-end',
                  gap: '8px',
                  marginBottom: '16px'
                }}
              >
                {msg.role === 'assistant' && (
                  <img
                    src="/atendente-avatar.jpg"
                    alt="Atendente"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '9999px',
                      flexShrink: 0
                    }}
                  />
                )}
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '12px 16px',
                    borderRadius: '16px',
                    backgroundColor: msg.role === 'user' ? '#7162f0' : 'white',
                    color: msg.role === 'user' ? 'white' : '#1f2937',
                    border: msg.role === 'assistant' ? '1px solid #e5e7eb' : 'none',
                    boxShadow: msg.role === 'assistant' ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none',
                    borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                    borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '16px'
                  }}
                >
                  <p style={{
                    fontSize: '14px',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.6',
                    margin: 0
                  }}>
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'flex-end',
                gap: '8px'
              }}>
                <img
                  src="/atendente-avatar.jpg"
                  alt="Atendente"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '9999px',
                    flexShrink: 0
                  }}
                />
                <div style={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  borderBottomLeftRadius: '0'
                }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#9ca3af',
                      borderRadius: '9999px',
                      animation: 'bounce 1s infinite'
                    }}></div>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#9ca3af',
                      borderRadius: '9999px',
                      animation: 'bounce 1s infinite 0.2s'
                    }}></div>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#9ca3af',
                      borderRadius: '9999px',
                      animation: 'bounce 1s infinite 0.4s'
                    }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{
            borderTop: '1px solid #e5e7eb',
            padding: '16px',
            backgroundColor: 'white'
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#111827',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                style={{
                  backgroundColor: loading || !input.trim() ? '#d1d5db' : '#7162f0',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s'
                }}
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
