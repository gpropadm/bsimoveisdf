'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import PropertyStoriesSection from '@/components/PropertyStoriesSection'
import Footer from '@/components/Footer'

export default function Home() {
  const [properties, setProperties] = useState<any[]>([])
  const [filteredProperties, setFilteredProperties] = useState<any[]>([])
  const [propertiesLoading, setPropertiesLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)

  const handleFilterChange = (filtered: any[]) => {
    setFilteredProperties(filtered)
  }

  useEffect(() => {
    const loadProperties = async () => {
      try {
        // Pequeno delay para mostrar skeleton (UX melhor)
        if (initialLoad) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }

        const propertiesResponse = await fetch('/api/properties')
        if (propertiesResponse.ok) {
          const propertiesData = await propertiesResponse.json()
          setProperties(propertiesData || [])
          setFilteredProperties(propertiesData || [])
        }
      } catch (error) {
        console.error('❌ Erro ao carregar dados:', error)
      } finally {
        setPropertiesLoading(false)
        setInitialLoad(false)
      }
    }

    loadProperties()
  }, [initialLoad])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main>
        {/* Hero Section com imagem de fundo */}
        <section className="relative py-20 text-white overflow-hidden">
          {/* Imagem de fundo */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2058&q=80)'
            }}
          ></div>
          {/* Overlay escuro para melhor legibilidade */}
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          {/* Conteúdo */}
          <div className="relative z-10">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-4">Para você morar bem</h1>
            <p className="text-xl mb-8">Escolher seu imóvel online nunca foi tão fácil como na Arbo</p>

            {/* Search Form */}
            <div className="max-w-4xl mx-auto">
              <form className="w-full flex flex-col lg:flex-row gap-2 p-4">
                <div className="flex-1">
                  <select className="w-full py-3 px-4 rounded-full border-0 text-gray-700 bg-white">
                    <option>Venda</option>
                    <option>Locação</option>
                  </select>
                </div>
                <div className="flex-1">
                  <select className="w-full py-3 px-4 rounded-full border-0 text-gray-700 bg-white">
                    <option>Tipo de imóvel</option>
                    <option>Apartamento</option>
                    <option>Casa</option>
                    <option>Terreno</option>
                  </select>
                </div>
                <div className="flex-1 lg:flex-[2]">
                  <input
                    type="text"
                    placeholder="Digite um bairro, cidade ou código do imóvel"
                    className="w-full py-3 px-4 rounded-full border-0 text-gray-700"
                  />
                </div>
                <button
                  type="submit"
                  className="text-white py-3 px-8 rounded-full font-semibold transition-colors hover:opacity-90 bg-orange-500"
                >
                  Buscar
                </button>
              </form>
            </div>
          </div>
          </div>
        </section>

        <PropertyStoriesSection
          properties={filteredProperties}
          loading={propertiesLoading}
        />
      </main>

      <Footer />
    </div>
  )
}