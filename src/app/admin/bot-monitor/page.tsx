'use client'

import AdminLayout from '@/components/AdminLayout'
import BotMonitor from '@/components/BotMonitor'

export default function BotMonitorPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🤖 Monitor de Conversas</h1>
              <p className="text-gray-600 mt-1">
                Acompanhe conversas do bot em tempo real
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                ⚙️ Configurar Bot
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                📊 Ver Relatório
              </button>
            </div>
          </div>

          {/* Stats rápidos */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium">Conversas Hoje</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">--</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium">Leads Criados</p>
              <p className="text-2xl font-bold text-green-900 mt-1">--</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600 font-medium">Leads Quentes</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">--</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-4">
              <p className="text-sm text-amber-600 font-medium">Taxa de Conversão</p>
              <p className="text-2xl font-bold text-amber-900 mt-1">--%</p>
            </div>
          </div>
        </div>

        {/* Monitor */}
        <BotMonitor />
      </div>
    </AdminLayout>
  )
}
