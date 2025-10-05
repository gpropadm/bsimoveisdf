'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'

interface SearchFilters {
  types: string[]
  categoriesByType: Record<string, string[]>
}

// BUSCA MINIMALISTA: Select com underline e estilo clean
export default function SearchFormMinimalista() {
  const router = useRouter()
  const { primaryColor } = useTheme()
  const [filters, setFilters] = useState<SearchFilters>({ types: [], categoriesByType: {} })
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [location, setLocation] = useState<string>('')
  const [loading, setLoading] = useState(true)

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
    return null
  }

  const categories = filters.categoriesByType ? Object.values(filters.categoriesByType).flat().filter((v, i, a) => a.indexOf(v) === i) : []

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-xl p-4 sm:p-6 md:p-8">
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 md:mb-6">
            {/* Tipo de Imóvel */}
            <div className="relative group">
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                Tipo de Imóvel
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-transparent border border-gray-200 rounded-md px-3 py-2 focus:border-gray-300 focus:outline-none text-gray-900 font-medium text-base appearance-none cursor-pointer transition-colors text-left"
                style={{
                  borderBottomColor: selectedCategory ? primaryColor : '',
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 16 16\'%3E%3Cpath fill=\'%23666\' d=\'M8 11L3 6h10z\'/%3E%3C/svg%3E")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center'
                }}
              >
                <option value="">Selecione</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Finalidade */}
            <div className="relative group">
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                Finalidade
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-transparent border border-gray-200 rounded-md px-3 py-2 focus:border-gray-300 focus:outline-none text-gray-900 font-medium text-base appearance-none cursor-pointer transition-colors text-left"
                style={{
                  borderBottomColor: selectedType ? primaryColor : '',
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 16 16\'%3E%3Cpath fill=\'%23666\' d=\'M8 11L3 6h10z\'/%3E%3C/svg%3E")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center'
                }}
              >
                <option value="">Selecione</option>
                {filters.types && filters.types.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Localização */}
            <div className="relative group">
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                Localização
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Cidade, bairro..."
                className="w-full bg-transparent border border-gray-200 rounded-md px-3 py-2 focus:border-gray-300 focus:outline-none text-gray-900 font-medium text-base placeholder:text-gray-300 transition-colors text-left"
                style={{
                  borderBottomColor: location ? primaryColor : ''
                }}
              />
            </div>
          </div>

          {/* Botão Buscar - Full Width */}
          <button
            type="submit"
            className="w-full h-12 sm:h-14 rounded-lg font-semibold text-white text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-[1.02] flex items-center justify-center gap-2 sm:gap-3"
            style={{ backgroundColor: primaryColor }}
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Buscar Imóvel
          </button>
        </form>
      </div>
    </div>
  )
}
