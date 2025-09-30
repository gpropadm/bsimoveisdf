'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useMapContext } from '@/contexts/MapContext'

export default function FilterBar() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { showMap, setShowMap } = useMapContext()

  const [activeType, setActiveType] = useState(searchParams.get('type') || 'venda')
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || '')

  const types = [
    { key: 'venda', label: 'Venda' },
    { key: 'aluguel', label: 'Locação' },
    { key: 'lancamento', label: 'Lançamento' },
    { key: 'empreendimento', label: 'Empreendimento' }
  ]

  const categories = [
    { key: '', label: 'Todos' },
    { key: 'casa', label: 'Casas' },
    { key: 'apartamento', label: 'Apartamentos' },
    { key: 'terreno', label: 'Terrenos' },
    { key: 'comercial', label: 'Comercial' },
    { key: 'rural', label: 'Rural' }
  ]

  const updateFilters = (type: string, category: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('type', type)
    if (category) {
      params.set('category', category)
    } else {
      params.delete('category')
    }
    router.push(`/imoveis?${params.toString()}`)
  }

  const handleTypeClick = (type: string) => {
    setActiveType(type)
    updateFilters(type, activeCategory)
  }

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category)
    updateFilters(activeType, category)
  }

  return (
    <div className="bg-white border-t border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Filtros - Lado Esquerdo */}
          <div className="flex items-center space-x-8 overflow-x-auto">
            {/* Tipos */}
            <div className="flex space-x-1 min-w-fit">
              {types.map((type) => (
                <button
                  key={type.key}
                  onClick={() => handleTypeClick(type.key)}
                  className={`px-4 py-2 rounded border text-sm font-medium transition-colors whitespace-nowrap ${
                    activeType === type.key
                      ? 'text-white'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                  }`}
                  style={activeType === type.key ? {
                    backgroundColor: '#4f2de8',
                    borderColor: '#4f2de8'
                  } : {}}
                >
                  {type.label}
                </button>
              ))}
            </div>

            <div className="w-px h-6 bg-gray-300" />

            {/* Categorias */}
            <div className="flex space-x-1 min-w-fit">
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => handleCategoryClick(category.key)}
                  className={`px-4 py-2 rounded border text-sm font-medium transition-colors whitespace-nowrap ${
                    activeCategory === category.key
                      ? 'text-white'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                  }`}
                  style={activeCategory === category.key ? {
                    backgroundColor: '#4f2de8',
                    borderColor: '#4f2de8'
                  } : {}}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Botão Toggle do Mapa - Lado Direito */}
          <div className="flex items-center gap-3 ml-4">
            <span className="text-sm text-gray-600 whitespace-nowrap">Mapa</span>
            <button
              onClick={() => setShowMap(!showMap)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                showMap
                  ? 'border-gray-300 shadow-lg'
                  : 'bg-gradient-to-r from-gray-200 to-gray-300 border-gray-300'
              }`}
              style={showMap ? { backgroundColor: '#4f2de8' } : {}}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ring-0 ${
                  showMap ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}