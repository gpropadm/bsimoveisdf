'use client'

import { useState, useEffect } from 'react'

interface ChatbotStats {
  today: StatsData
  month: StatsData
  total: StatsData
}

interface StatsData {
  conversations: number
  messages: number
  tokensInput: number
  tokensOutput: number
  cost: number
  leads: number
}

export default function ChatbotDashboard() {
  const [stats, setStats] = useState<ChatbotStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/chatbot-stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6">
        <p className="text-center text-gray-600">Carregando estatísticas...</p>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            🤖 Chatbot IA - Estatísticas
          </h3>
          <p className="text-sm text-gray-600">Powered by Anthropic Claude Sonnet 4.5</p>
        </div>
        <button
          onClick={fetchStats}
          className="px-3 py-1 text-sm bg-white border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors"
        >
          🔄 Atualizar
        </button>
      </div>

      {/* Estatísticas de Hoje */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-purple-100 p-4">
          <h4 className="text-sm font-semibold text-purple-900 mb-3">📅 Hoje</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Conversas:</span>
              <span className="font-semibold text-gray-900">{stats.today.conversations}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Mensagens:</span>
              <span className="font-semibold text-gray-900">{stats.today.messages}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Leads gerados:</span>
              <span className="font-semibold text-green-600">{stats.today.leads}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
              <span className="text-gray-600">Custo estimado:</span>
              <span className="font-bold text-purple-600">${stats.today.cost.toFixed(4)}</span>
            </div>
          </div>
        </div>

        {/* Estatísticas do Mês */}
        <div className="bg-white rounded-lg border border-blue-100 p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-3">📆 Este Mês</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Conversas:</span>
              <span className="font-semibold text-gray-900">{stats.month.conversations}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Mensagens:</span>
              <span className="font-semibold text-gray-900">{stats.month.messages}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Leads gerados:</span>
              <span className="font-semibold text-green-600">{stats.month.leads}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
              <span className="text-gray-600">Custo estimado:</span>
              <span className="font-bold text-blue-600">${stats.month.cost.toFixed(4)}</span>
            </div>
          </div>
        </div>

        {/* Estatísticas Totais */}
        <div className="bg-white rounded-lg border border-indigo-100 p-4">
          <h4 className="text-sm font-semibold text-indigo-900 mb-3">📊 Total</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Conversas:</span>
              <span className="font-semibold text-gray-900">{stats.total.conversations}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Mensagens:</span>
              <span className="font-semibold text-gray-900">{stats.total.messages}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Leads gerados:</span>
              <span className="font-semibold text-green-600">{stats.total.leads}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
              <span className="text-gray-600">Custo total:</span>
              <span className="font-bold text-indigo-600">${stats.total.cost.toFixed(4)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info adicional */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">💡 Informações</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600">
          <div>
            <span className="font-medium">Tokens processados (hoje):</span> {(stats.today.tokensInput + stats.today.tokensOutput).toLocaleString()}
          </div>
          <div>
            <span className="font-medium">Taxa de conversão (hoje):</span> {stats.today.conversations > 0 ? ((stats.today.leads / stats.today.conversations) * 100).toFixed(1) : 0}%
          </div>
        </div>
      </div>
    </div>
  )
}
