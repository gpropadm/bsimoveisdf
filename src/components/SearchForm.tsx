'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'

interface SearchFilters {
  types: string[]
  categoriesByType: Record<string, string[]>
}

export default function SearchForm() {
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
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-10 bg-white rounded mb-6"></div>
          <div className="h-14 bg-white rounded-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4">
      {/* Formulário de Busca Melhorado */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl md:rounded-full shadow-2xl">
        <form onSubmit={handleSearch}>
          <div className="flex flex-col md:flex-row items-stretch md:items-center">

            {/* Tipo de Imóvel - Sem borda */}
            <div className="w-full md:w-auto border-b md:border-b-0 border-gray-200">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full md:w-[180px] h-16 px-6 bg-transparent border-none focus:outline-none focus:ring-0 text-gray-700 font-medium text-base appearance-none cursor-pointer rounded-t-3xl md:rounded-l-full md:rounded-t-none"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23666\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.5rem center' }}
              >
                <option value="">Tipo</option>
                {filters.categoriesByType && Object.values(filters.categoriesByType).flat().filter((v, i, a) => a.indexOf(v) === i).map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Divisor vertical - apenas desktop */}
            <div className="hidden md:block h-10 w-px bg-gray-300"></div>

            {/* Finalidade - Venda/Aluguel */}
            <div className="w-full md:w-auto border-b md:border-b-0 border-gray-200">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full md:w-[180px] h-16 px-6 bg-transparent border-none focus:outline-none focus:ring-0 text-gray-700 font-medium text-base appearance-none cursor-pointer"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23666\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.5rem center' }}
              >
                <option value="">Finalidade</option>
                {filters.types && filters.types.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Divisor vertical - apenas desktop */}
            <div className="hidden md:block h-10 w-px bg-gray-300"></div>

            {/* Localização - Grande */}
            <div className="w-full md:flex-1 border-b md:border-b-0 border-gray-200">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Onde você quer morar? (cidade, bairro...)"
                className="w-full h-16 px-6 bg-transparent border-none focus:outline-none focus:ring-0 text-gray-700 text-base placeholder:text-gray-400"
              />
            </div>

            {/* Botão Buscar - Apenas Lupa */}
            <div className="w-full md:w-auto flex justify-center md:pr-6">
              <button
                type="submit"
                className="w-full md:w-auto h-16 px-4 bg-transparent hover:bg-gray-50 rounded-b-3xl md:rounded-r-full md:rounded-b-none transition-all duration-200 flex items-center justify-center cursor-pointer"
                style={{ color: primaryColor }}
                title="Buscar"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}