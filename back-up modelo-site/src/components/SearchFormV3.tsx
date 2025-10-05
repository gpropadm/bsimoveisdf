'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'

interface SearchFilters {
  types: string[]
  categoriesByType: Record<string, string[]>
}

// VERSÃO 3: Dropdown customizado com hover effect
export default function SearchFormV3() {
  const router = useRouter()
  const { primaryColor } = useTheme()
  const [filters, setFilters] = useState<SearchFilters>({ types: [], categoriesByType: {} })
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [location, setLocation] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)

  const categoryRef = useRef<HTMLDivElement>(null)
  const typeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchFilters()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false)
      }
      if (typeRef.current && !typeRef.current.contains(event.target as Node)) {
        setShowTypeDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
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

  const categories = filters.categoriesByType ? Object.values(filters.categoriesByType).flat().filter((v, i, a) => a.indexOf(v) === i) : []

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-full shadow-2xl">
        <form onSubmit={handleSearch}>
          <div className="flex flex-col md:flex-row items-stretch md:items-center">

            {/* Tipo de Imóvel - Dropdown */}
            <div className="relative flex-1" ref={categoryRef}>
              <button
                type="button"
                onClick={() => {
                  setShowCategoryDropdown(!showCategoryDropdown)
                  setShowTypeDropdown(false)
                }}
                className="w-full h-16 px-6 bg-transparent border-b md:border-b-0 border-gray-200 focus:outline-none text-left flex items-center justify-between rounded-t-full md:rounded-l-full md:rounded-t-none hover:bg-gray-50 transition-colors"
              >
                <span className={`font-medium ${selectedCategory ? 'text-gray-900' : 'text-gray-500'}`}>
                  {selectedCategory ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) : 'Tipo de Imóvel'}
                </span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showCategoryDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                  <div className="py-2 max-h-64 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory('')
                        setShowCategoryDropdown(false)
                      }}
                      className="w-full px-6 py-3 text-left hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                    >
                      Todos os Tipos
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(category)
                          setShowCategoryDropdown(false)
                        }}
                        className="w-full px-6 py-3 text-left hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                        style={{
                          backgroundColor: selectedCategory === category ? `${primaryColor}15` : '',
                          color: selectedCategory === category ? primaryColor : ''
                        }}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden md:block h-10 w-px bg-gray-300"></div>

            {/* Finalidade - Dropdown */}
            <div className="relative flex-1" ref={typeRef}>
              <button
                type="button"
                onClick={() => {
                  setShowTypeDropdown(!showTypeDropdown)
                  setShowCategoryDropdown(false)
                }}
                className="w-full h-16 px-6 bg-transparent border-b md:border-b-0 border-gray-200 focus:outline-none text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className={`font-medium ${selectedType ? 'text-gray-900' : 'text-gray-500'}`}>
                  {selectedType ? selectedType.charAt(0).toUpperCase() + selectedType.slice(1) : 'Finalidade'}
                </span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${showTypeDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showTypeDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                  <div className="py-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedType('')
                        setShowTypeDropdown(false)
                      }}
                      className="w-full px-6 py-3 text-left hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                    >
                      Todas
                    </button>
                    {filters.types && filters.types.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setSelectedType(type)
                          setShowTypeDropdown(false)
                        }}
                        className="w-full px-6 py-3 text-left hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                        style={{
                          backgroundColor: selectedType === type ? `${primaryColor}15` : '',
                          color: selectedType === type ? primaryColor : ''
                        }}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden md:block h-10 w-px bg-gray-300"></div>

            {/* Localização */}
            <div className="flex-1 border-b md:border-b-0 border-gray-200">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Onde você quer morar?"
                className="w-full h-16 px-6 bg-transparent border-none focus:outline-none text-gray-700 text-base placeholder:text-gray-400"
              />
            </div>

            {/* Botão Buscar */}
            <div className="w-full md:w-auto flex justify-center md:pr-2">
              <button
                type="submit"
                className="w-full md:w-auto h-16 px-8 rounded-b-full md:rounded-full md:rounded-b-full transition-all duration-200 flex items-center justify-center cursor-pointer font-semibold text-white shadow-lg hover:shadow-xl"
                style={{ backgroundColor: primaryColor }}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Buscar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
