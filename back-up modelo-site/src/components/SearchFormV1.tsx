'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'

interface SearchFilters {
  types: string[]
  categoriesByType: Record<string, string[]>
}

// VERSÃO 1: Select com bordas arredondadas, sombras e ícones destacados
export default function SearchFormV1() {
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
          <div className="h-14 bg-white rounded-2xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-4">
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Tipo de Imóvel */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-14 pl-12 pr-10 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-700 font-medium text-base appearance-none cursor-pointer transition-all"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23666\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center' }}
              >
                <option value="">Tipo de Imóvel</option>
                {filters.categoriesByType && Object.values(filters.categoriesByType).flat().filter((v, i, a) => a.indexOf(v) === i).map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Finalidade */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full h-14 pl-12 pr-10 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-700 font-medium text-base appearance-none cursor-pointer transition-all"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23666\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center' }}
              >
                <option value="">Finalidade</option>
                {filters.types && filters.types.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Localização */}
            <div className="relative">
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
                className="w-full h-14 pl-12 pr-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-700 text-base placeholder:text-gray-400 transition-all"
              />
            </div>

            {/* Botão Buscar */}
            <button
              type="submit"
              className="h-14 px-8 rounded-xl font-semibold text-white text-base transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              style={{ backgroundColor: primaryColor }}
            >
              Buscar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
