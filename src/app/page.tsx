'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import PropertyStoriesSection from '@/components/PropertyStoriesSection'
import Footer from '@/components/Footer'
import SearchForm from '@/components/SearchForm'
import AIRecommendations from '@/components/AIRecommendations'

export default function Home() {
  const [properties, setProperties] = useState<any[]>([])
  const [filteredProperties, setFilteredProperties] = useState<any[]>([])
  const [propertiesLoading, setPropertiesLoading] = useState(true)
  // Header otimizado - sem API calls
  const headerSettings = {
    headerTitle: 'Encontre o Imóvel Perfeito no DF',
    headerSubtitle: 'Casas, apartamentos e coberturas no Distrito Federal'
  }

  const handleFilterChange = (filtered: any[]) => {
    setFilteredProperties(filtered)
  }

  useEffect(() => {
    // Carregar dados reais diretamente
    const loadProperties = async () => {
      try {
        const propertiesResponse = await fetch('/api/properties?limit=6')
        if (propertiesResponse.ok) {
          const propertiesData = await propertiesResponse.json()
          setProperties(propertiesData || [])
          setFilteredProperties(propertiesData || [])
        }
      } catch (error) {
        console.error('❌ Erro ao carregar propriedades:', error)
        setProperties([])
        setFilteredProperties([])
      } finally {
        setPropertiesLoading(false)
      }
    }

    loadProperties()
  }, [])

  return (
    <div className="min-h-screen bg-[#f9f3ea]">
      <Header />

      <main>
        {/* Hero Section com imagem */}
        <section
          className="relative py-12 md:py-20 text-white overflow-hidden"
          style={{
            height: '80vh',
            minHeight: '500px',
            backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/header-bg.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Conteúdo */}
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 leading-tight">
                {headerSettings.headerTitle}
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 md:mb-12 px-4">
                {headerSettings.headerSubtitle}
              </p>

              {/* Search Form */}
              <SearchForm />
            </div>
          </div>
        </section>

        {/* Propriedades principais - OTIMIZADO (máximo 6) */}
        <PropertyStoriesSection
          properties={filteredProperties}
          loading={propertiesLoading}
        />

        {/* IA Recommendations - DESABILITADO temporariamente para performance */}
        {/* {!propertiesLoading && <AIRecommendations />} */}
      </main>

      <Footer />
    </div>
  )
}