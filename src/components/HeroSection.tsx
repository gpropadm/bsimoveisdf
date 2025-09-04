'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Property {
  id: string
  title: string
  slug: string
  city: string
  price: number
  type: string
  images?: string[] | string
  category?: string
  address?: string
  bedrooms?: number
  bathrooms?: number
  area?: number
  parking?: number
}

interface HeroSectionProps {
  properties?: Property[]
  onFilterChange?: (filteredProperties: Property[]) => void
}

export default function HeroSection({ properties = [], onFilterChange }: HeroSectionProps) {
  const [filters, setFilters] = useState({
    category: '',
    type: '',
    city: '',
    maxPrice: 2000000
  })
  const router = useRouter()

  // Extrair cidades e categorias únicas das propriedades
  const uniqueCities = [...new Set(properties.map(property => property.city))].sort()
  const uniqueCategories = [...new Set(properties.map(property => property.category).filter(Boolean))].sort()
  
  // Determinar valor máximo baseado no tipo selecionado
  const getMaxPrice = () => {
    if (!filters.type) {
      return Math.max(...properties.map(p => p.price), 2000000)
    }
    
    const filteredByType = properties.filter(p => p.type?.trim().toLowerCase() === filters.type?.trim().toLowerCase())
    if (filteredByType.length === 0) {
      return filters.type.toLowerCase() === 'aluguel' ? 20000 : 5000000
    }
    
    return Math.max(...filteredByType.map(p => p.price))
  }

  const getMinPrice = () => {
    if (!filters.type) {
      return Math.min(...properties.map(p => p.price), 50000)
    }
    
    const filteredByType = properties.filter(p => p.type?.trim().toLowerCase() === filters.type?.trim().toLowerCase())
    if (filteredByType.length === 0) {
      return filters.type.toLowerCase() === 'aluguel' ? 1000 : 50000
    }
    
    return Math.min(...filteredByType.map(p => p.price))
  }

  const getStep = () => {
    if (!filters.type) return 50000
    return filters.type.toLowerCase() === 'aluguel' ? 250 : 50000
  }

  const maxPropertyPrice = getMaxPrice()
  const minPropertyPrice = getMinPrice()
  const stepPrice = getStep()
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const applyFilters = (newFilters: typeof filters) => {
    if (!onFilterChange) return
    
    let filtered = properties

    // Filtrar por categoria
    if (newFilters.category) {
      filtered = filtered.filter(property => {
        const propertyCategory = property.category?.trim().toLowerCase()
        const filterCategory = newFilters.category?.trim().toLowerCase()
        return propertyCategory === filterCategory
      })
    }

    // Filtrar por tipo/finalidade
    if (newFilters.type) {
      filtered = filtered.filter(property => {
        const propertyType = property.type?.trim().toLowerCase()
        const filterType = newFilters.type?.trim().toLowerCase()
        return propertyType === filterType
      })
    }

    // Filtrar por cidade
    if (newFilters.city) {
      filtered = filtered.filter(property => property.city === newFilters.city)
    }

    // Filtrar por preço máximo
    filtered = filtered.filter(property => property.price <= newFilters.maxPrice)

    onFilterChange(filtered)
  }

  const handleFilterChange = (key: keyof typeof filters, value: string | number) => {
    let newFilters = { ...filters, [key]: value }
    
    // Se mudou o tipo, ajustar o maxPrice para o novo range
    if (key === 'type') {
      let newMaxForType, newMinForType
      
      if (value === '') {
        newMaxForType = Math.max(...properties.map(p => p.price), 2000000)
        newMinForType = Math.min(...properties.map(p => p.price), 50000)
      } else {
        const filteredByType = properties.filter(p => p.type?.trim().toLowerCase() === (value as string)?.trim().toLowerCase())
        
        if (filteredByType.length > 0) {
          newMaxForType = Math.max(...filteredByType.map(p => p.price))
          newMinForType = Math.min(...filteredByType.map(p => p.price))
        } else {
          newMaxForType = value === 'aluguel' ? 20000 : 5000000
          newMinForType = value === 'aluguel' ? 1000 : 50000
        }
      }
      
      if (filters.maxPrice < newMinForType || filters.maxPrice > newMaxForType) {
        newFilters.maxPrice = newMaxForType
      }
    }
    
    setFilters(newFilters)
    applyFilters(newFilters)
  }

  const clearFilters = () => {
    const newFilters = {
      category: '',
      type: '',
      city: '',
      maxPrice: maxPropertyPrice
    }
    setFilters(newFilters)
    if (onFilterChange) onFilterChange(properties)
  }

  return (
    <section className="relative h-auto md:h-[700px] flex items-center justify-center overflow-hidden bg-white md:bg-transparent py-8 md:py-0">
      {/* Background Image - Hidden on mobile */}
      <div className="absolute inset-0 hidden md:block">
        <Image
          src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
          alt="Casa moderna de luxo"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8 hidden md:block">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight font-display">
            Encontre o 
            <span className="block text-[#bf530b]">
              Imóvel dos Seus Sonhos
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed">
            Apartamentos, casas e salas comerciais com a qualidade e confiança que você merece
          </p>
        </div>


        {/* Property Filters */}
        <div className="bg-white md:bg-white/15 md:backdrop-blur-sm rounded-2xl p-6 border border-gray-200 md:border-white/20 shadow-lg md:shadow-none max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
            {/* Tipo de Imóvel */}
            <div>
              <label className="block text-sm font-medium text-gray-700 md:text-white mb-2">
                Tipo
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors bg-white"
              >
                <option value="">Todos</option>
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Finalidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 md:text-white mb-2">
                Finalidade
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors bg-white"
              >
                <option value="">Todos</option>
                <option value="venda">Venda</option>
                <option value="aluguel">Aluguel</option>
              </select>
            </div>

            {/* Cidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 md:text-white mb-2">
                Cidade
              </label>
              <select
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors bg-white"
              >
                <option value="">Todas as cidades</option>
                {uniqueCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Valor Máximo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 md:text-white mb-2">
                Valor até: {formatPrice(filters.maxPrice)}
              </label>
              <div className="relative h-10 flex items-center">
                <input
                  type="range"
                  min={minPropertyPrice}
                  max={maxPropertyPrice}
                  step={stepPrice}
                  value={Math.min(filters.maxPrice, maxPropertyPrice)}
                  onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value))}
                  className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>

            {/* Botão Limpar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 md:text-white mb-2 opacity-0">
                Ação
              </label>
              <button
                onClick={clearFilters}
                className="w-full bg-gray-100 md:bg-white/20 hover:bg-gray-200 md:hover:bg-white/30 text-gray-700 md:text-white text-sm py-3 px-4 rounded-lg transition-colors duration-200 border border-gray-300 md:border-white/30"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>

        <style jsx>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #14b8a6;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }

          .slider::-moz-range-thumb {
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #14b8a6;
            cursor: pointer;
            border: none;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }

          .slider::-webkit-slider-track {
            height: 8px;
            border-radius: 4px;
            background: linear-gradient(to right, #14b8a6 0%, #14b8a6 ${((Math.min(filters.maxPrice, maxPropertyPrice) - minPropertyPrice) / (maxPropertyPrice - minPropertyPrice)) * 100}%, rgba(255,255,255,0.3) ${((Math.min(filters.maxPrice, maxPropertyPrice) - minPropertyPrice) / (maxPropertyPrice - minPropertyPrice)) * 100}%, rgba(255,255,255,0.3) 100%);
          }

          .slider::-moz-range-track {
            height: 8px;
            border-radius: 4px;
            background: rgba(255,255,255,0.3);
          }

          .slider::-moz-range-progress {
            height: 8px;
            border-radius: 4px;
            background: #14b8a6;
          }
        `}</style>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-bounce"></div>
        </div>
      </div>

    </section>
  )
}