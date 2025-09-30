'use client'

import { useState } from 'react'

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

interface PropertyFiltersProps {
  properties: Property[]
  onFilterChange: (filteredProperties: Property[]) => void
}

export default function PropertyFilters({ properties, onFilterChange }: PropertyFiltersProps) {
  const [filters, setFilters] = useState({
    category: '',
    type: '',
    city: '',
    maxPrice: 2000000
  })

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
    onFilterChange(properties)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 md:p-4 mb-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 items-start">
        {/* Tipo de Imóvel */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Tipo
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full p-2 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
          >
            <option value="">Todos</option>
            {uniqueCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Finalidade */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Finalidade
          </label>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="w-full p-2 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
          >
            <option value="">Todos</option>
            <option value="venda">Venda</option>
            <option value="aluguel">Aluguel</option>
          </select>
        </div>

        {/* Cidade */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Cidade
          </label>
          <select
            value={filters.city}
            onChange={(e) => handleFilterChange('city', e.target.value)}
            className="w-full p-2 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
          >
            <option value="">Todas as cidades</option>
            {uniqueCities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Valor Máximo */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Valor até: <span className="font-semibold">{formatPrice(filters.maxPrice)}</span>
          </label>
          <div className="relative h-8 md:h-8 flex items-center">
            <input
              type="range"
              min={minPropertyPrice}
              max={maxPropertyPrice}
              step={stepPrice}
              value={Math.min(filters.maxPrice, maxPropertyPrice)}
              onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value))}
              className="w-full h-3 md:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>

        {/* Botão Limpar */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-xs font-medium text-gray-600 mb-1 opacity-0">
            Ação
          </label>
          <button
            onClick={clearFilters}
            className="w-full bg-gray-50 hover:bg-gray-100 text-gray-500 text-sm py-2 px-3 rounded-md transition-colors duration-200 border border-gray-200 h-8 flex items-center justify-center"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #f97316;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          border: 2px solid white;
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #f97316;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        @media (max-width: 768px) {
          .slider::-webkit-slider-thumb {
            height: 24px;
            width: 24px;
            border: 3px solid white;
          }

          .slider::-moz-range-thumb {
            height: 24px;
            width: 24px;
            border: 3px solid white;
          }
        }

        .slider::-webkit-slider-track {
          height: 8px;
          border-radius: 4px;
          background: linear-gradient(to right, #f97316 0%, #f97316 ${((Math.min(filters.maxPrice, maxPropertyPrice) - minPropertyPrice) / (maxPropertyPrice - minPropertyPrice)) * 100}%, #e5e7eb ${((Math.min(filters.maxPrice, maxPropertyPrice) - minPropertyPrice) / (maxPropertyPrice - minPropertyPrice)) * 100}%, #e5e7eb 100%);
        }

        .slider::-moz-range-track {
          height: 8px;
          border-radius: 4px;
          background: #e5e7eb;
        }

        .slider::-moz-range-progress {
          height: 8px;
          border-radius: 4px;
          background: #f97316;
        }

        @media (max-width: 768px) {
          .slider::-webkit-slider-track {
            height: 10px;
            border-radius: 5px;
          }

          .slider::-moz-range-track {
            height: 10px;
            border-radius: 5px;
          }

          .slider::-moz-range-progress {
            height: 10px;
            border-radius: 5px;
          }
        }
      `}</style>
    </div>
  )
}