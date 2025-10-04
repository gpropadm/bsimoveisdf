'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'

interface SearchFilters {
  types: string[]
  categoriesByType: Record<string, string[]>
}

// VERSÃO 2: Botões toggle ao invés de select
export default function SearchFormV2() {
  const router = useRouter()
  const { primaryColor } = useTheme()
  const [filters, setFilters] = useState<SearchFilters>({ types: [], categoriesByType: {} })
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [location, setLocation] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [showCategoryMenu, setShowCategoryMenu] = useState(false)
  const [showTypeMenu, setShowTypeMenu] = useState(false)

  useEffect(() => {
    fetchFilters()
  }, [])

  const fetchFilters = async () => {
    try {
      const response = await fetch('/api/search-filters')
      if (response.ok) {
        const data = await response.json()
        setFilters(data)
      }
    } catch (error) {
      console.error('Erro ao carregar filtros:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    const searchParams = new URLSearchParams()

    if (selectedType) searchParams.set('type', selectedType)
    if (selectedCategory) searchParams.set('category', selectedCategory)
    if (location.trim()) {
      const locationParts = location.trim().split(' - ')
      if (locationParts.length === 2) {
        searchParams.set('city', locationParts[0])
        searchParams.set('state', locationParts[1])
      } else {
        searchParams.set('city', location.trim())
      }
    }

    router.push(`/imoveis?${searchParams.toString()}`)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-10 bg-white rounded mb-6"></div>
          <div className="h-14 bg-white rounded-2xl"></div>
        </div>
      </div>
    )
  }

  const categories = filters.categoriesByType ? Object.values(filters.categoriesByType).flat().filter((v, i, a) => a.indexOf(v) === i) : []

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6">
        <form onSubmit={handleSearch}>
          <div className="space-y-6">
            {/* Tipo de Imóvel - Botões */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Tipo de Imóvel</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('')}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === ''
                      ? 'text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={{ backgroundColor: selectedCategory === '' ? primaryColor : '' }}
                >
                  Todos
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? 'text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={{ backgroundColor: selectedCategory === category ? primaryColor : '' }}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Finalidade - Botões */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Finalidade</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedType('')}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                    selectedType === ''
                      ? 'text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={{ backgroundColor: selectedType === '' ? primaryColor : '' }}
                >
                  Todas
                </button>
                {filters.types && filters.types.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                      selectedType === type
                        ? 'text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={{ backgroundColor: selectedType === type ? primaryColor : '' }}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Localização e Buscar */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Cidade, bairro..."
                  className="w-full h-12 pl-12 pr-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-700 text-base placeholder:text-gray-400"
                />
              </div>
              <button
                type="submit"
                className="px-8 h-12 rounded-xl font-semibold text-white text-base transition-all duration-200 shadow-lg hover:shadow-xl"
                style={{ backgroundColor: primaryColor }}
              >
                Buscar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
