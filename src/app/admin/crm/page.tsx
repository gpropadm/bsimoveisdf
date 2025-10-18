'use client'

import { useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import CRMKanban from '@/components/CRMKanban'

export default function CRMPage() {
  const [activeView, setActiveView] = useState<'kanban' | 'list'>('kanban')

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">CRM - Funil de Vendas</h1>
              <p className="text-gray-600 mt-1">
                Gerencie seus leads visualmente com drag & drop
              </p>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-3">
              {/* Toggle View */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveView('kanban')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    activeView === 'kanban'
                      ? 'bg-white shadow text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📊 Kanban
                </button>
                <button
                  onClick={() => setActiveView('list')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    activeView === 'list'
                      ? 'bg-white shadow text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📋 Lista
                </button>
              </div>

              {/* Botão Novo Lead */}
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <span className="text-xl">+</span>
                <span>Novo Lead</span>
              </button>
            </div>
          </div>

          {/* Stats rápidos */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium">Total de Leads</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">--</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium">Leads Quentes</p>
              <p className="text-2xl font-bold text-green-900 mt-1">--</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600 font-medium">Em Negociação</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">--</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-4">
              <p className="text-sm text-amber-600 font-medium">Taxa de Conversão</p>
              <p className="text-2xl font-bold text-amber-900 mt-1">--%</p>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeView === 'kanban' ? (
            <CRMKanban />
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>Visualização em lista em desenvolvimento...</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
