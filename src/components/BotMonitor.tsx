'use client'

import { useState, useEffect } from 'react'

interface BotMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface BotSession {
  id: string
  channelId: string
  userName: string
  lastMessage: string
  messagesCount: number
  leadCreated: boolean
  lastMessageAt: string
  status: string
  messages: BotMessage[]
  context: any
}

export default function BotMonitor() {
  const [sessions, setSessions] = useState<BotSession[]>([])
  const [selectedSession, setSelectedSession] = useState<BotSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    fetchSessions()

    if (autoRefresh) {
      const interval = setInterval(fetchSessions, 10000) // Atualiza a cada 10s
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/admin/bot-sessions?status=active')
      if (response.ok) {
        const data = await response.json()
        setSessions(data)
        setLoading(false)
      }
    } catch (error) {
      console.error('Erro ao buscar sessões:', error)
      setLoading(false)
    }
  }

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 13) {
      return `+${cleaned.slice(0, 2)} (${cleaned.slice(2, 4)}) ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`
    }
    return phone
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 60) return `há ${diff}s`
    if (diff < 3600) return `há ${Math.floor(diff / 60)}min`
    if (diff < 86400) return `há ${Math.floor(diff / 3600)}h`
    return date.toLocaleDateString('pt-BR')
  }

  const getLeadScore = (session: BotSession) => {
    // Calcular score básico baseado no contexto
    let score = 0
    if (session.context?.userName) score += 15
    if (session.context?.userEmail) score += 15
    if (session.context?.userPhone) score += 10
    if (session.context?.preferences?.city) score += 10
    if (session.context?.preferences?.maxPrice) score += 15
    if (session.context?.intent === 'high') score += 25
    else if (session.context?.intent === 'medium') score += 15

    if (score >= 60) return { score, level: 'HOT', color: 'text-red-600 bg-red-50' }
    if (score >= 40) return { score, level: 'WARM', color: 'text-orange-600 bg-orange-50' }
    return { score, level: 'COLD', color: 'text-blue-600 bg-blue-50' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-4 h-[calc(100vh-200px)]">
      {/* Lista de Conversas */}
      <div className="col-span-1 bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b flex items-center justify-between bg-gray-50">
          <h3 className="font-semibold text-gray-900">Conversas Ativas</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`text-xs px-2 py-1 rounded ${
                autoRefresh
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {autoRefresh ? '🔄 Auto' : '⏸️ Paused'}
            </button>
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm font-medium">
              {sessions.length}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {sessions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-sm">Nenhuma conversa ativa</p>
            </div>
          ) : (
            sessions.map((session) => {
              const scoreData = getLeadScore(session)
              return (
                <div
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedSession?.id === session.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900">
                        {session.userName || 'Cliente'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatPhone(session.channelId)}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded font-semibold ${scoreData.color}`}>
                      🔥 {scoreData.level}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {session.lastMessage}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{formatTime(session.lastMessageAt)}</span>
                    <div className="flex items-center gap-2">
                      <span>{session.messagesCount} msgs</span>
                      {session.leadCreated && (
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">
                          ✓ Lead
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Chat */}
      <div className="col-span-2 bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
        {selectedSession ? (
          <>
            {/* Header do Chat */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedSession.userName || 'Cliente'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {formatPhone(selectedSession.channelId)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedSession.leadCreated && (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                      ✓ Lead Criado
                    </span>
                  )}
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                    Assumir Conversa
                  </button>
                </div>
              </div>

              {/* Contexto do Lead */}
              {selectedSession.context && Object.keys(selectedSession.context).length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs font-semibold text-blue-900 mb-2">Informações Capturadas:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {selectedSession.context.userName && (
                      <div><strong>Nome:</strong> {selectedSession.context.userName}</div>
                    )}
                    {selectedSession.context.userEmail && (
                      <div><strong>Email:</strong> {selectedSession.context.userEmail}</div>
                    )}
                    {selectedSession.context.preferences?.city && (
                      <div><strong>Cidade:</strong> {selectedSession.context.preferences.city}</div>
                    )}
                    {selectedSession.context.preferences?.category && (
                      <div><strong>Tipo:</strong> {selectedSession.context.preferences.category}</div>
                    )}
                    {selectedSession.context.preferences?.bedrooms && (
                      <div><strong>Quartos:</strong> {selectedSession.context.preferences.bedrooms}</div>
                    )}
                    {selectedSession.context.preferences?.maxPrice && (
                      <div><strong>Orçamento:</strong> até R$ {selectedSession.context.preferences.maxPrice.toLocaleString()}</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {selectedSession.messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p className={`text-xs mt-1 ${
                      msg.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                    }`}>
                      {new Date(msg.timestamp).toLocaleTimeString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-4xl mb-2">💬</p>
              <p>Selecione uma conversa para visualizar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
