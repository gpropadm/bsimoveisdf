'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchBar() {
  const router = useRouter()
  const [searchData, setSearchData] = useState({
    type: '',
    category: '',
    location: ''
  })

  const handleSearch = () => {
    // Construir URL de busca baseada nos filtros
    const params = new URLSearchParams()
    
    if (searchData.type) {
      params.append('type', searchData.type)
    }
    if (searchData.category) {
      params.append('category', searchData.category)
    }
    if (searchData.location) {
      params.append('location', searchData.location)
    }

    // Redirecionar para a página apropriada com os filtros
    const baseUrl = searchData.type === 'aluguel' ? '/aluguel' : '/venda'
    const searchUrl = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl
    
    router.push(searchUrl)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="bg-white rounded-lg p-6 max-w-4xl mx-auto shadow-2xl">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <select 
            value={searchData.type}
            onChange={(e) => setSearchData({...searchData, type: e.target.value})}
            className="w-full p-4 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Comprar ou Alugar</option>
            <option value="venda">Comprar</option>
            <option value="aluguel">Alugar</option>
          </select>
        </div>
        <div>
          <select 
            value={searchData.category}
            onChange={(e) => setSearchData({...searchData, category: e.target.value})}
            className="w-full p-4 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tipo de Imóvel</option>
            <option value="apartamento">Apartamento</option>
            <option value="casa">Casa</option>
            <option value="cobertura">Cobertura</option>
            <option value="terreno">Terreno</option>
          </select>
        </div>
        <div>
          <input
            type="text"
            value={searchData.location}
            onChange={(e) => setSearchData({...searchData, location: e.target.value})}
            onKeyDown={handleKeyDown}
            placeholder="Cidade ou Bairro"
            className="w-full p-4 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <button 
            onClick={handleSearch}
            className="w-full bg-blue-600 text-white p-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2 text-base whitespace-nowrap"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <span>Encontrar Imóvel</span>
          </button>
        </div>
      </div>
    </div>
  )
}