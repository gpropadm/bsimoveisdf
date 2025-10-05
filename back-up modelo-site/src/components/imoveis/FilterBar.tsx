'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useMapContext } from '@/contexts/MapContext'
import { useTheme } from '@/contexts/ThemeContext'

interface FilterOption {
  key: string
  label: string
}

export default function FilterBar() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { showMap, setShowMap } = useMapContext()
  const { primaryColor } = useTheme()

  const [activeType, setActiveType] = useState(searchParams.get('type') || 'venda')
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || '')
  const [types, setTypes] = useState<FilterOption[]>([])
  const [categories, setCategories] = useState<FilterOption[]>([])
  const [loading, setLoading] = useState(true)

  // Busca filtros dinâmicos do banco de dados
  useEffect(() => {
    async function fetchFilters() {
      try {
        const response = await fetch('/api/properties/filters')
        if (response.ok) {
          const data = await response.json()
          setTypes(data.types || [])
          setCategories(data.categories || [])

          // Se não houver tipo ativo e houver tipos disponíveis, seleciona o primeiro
          if (!searchParams.get('type') && data.types.length > 0) {
            setActiveType(data.types[0].key)
          }
        }
      } catch (error) {
        console.error('Erro ao buscar filtros:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFilters()
  }, [])

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

  if (loading) {
    return (
      <div className="bg-white border-t border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="text-gray-500 text-sm">Carregando filtros...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border-t border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Filtros - Lado Esquerdo */}
          <div className="flex items-center space-x-8 overflow-x-auto">
            {/* Tipos */}
            {types.length > 0 && (
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
                    backgroundColor: primaryColor,
                    borderColor: primaryColor
                  } : {}}
                >
                  {type.label}
                </button>
              ))}
              </div>
            )}

            {types.length > 0 && categories.length > 0 && (
              <div className="w-px h-6 bg-gray-300" />
            )}

            {/* Categorias */}
            {categories.length > 0 && (
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
                    backgroundColor: primaryColor,
                    borderColor: primaryColor
                  } : {}}
                >
                  {category.label}
                </button>
                ))}
              </div>
            )}
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
              style={showMap ? { backgroundColor: primaryColor } : {}}
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