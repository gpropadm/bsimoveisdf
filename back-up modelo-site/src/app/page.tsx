'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import PropertyStoriesSection from '@/components/PropertyStoriesSection'
import Footer from '@/components/Footer'
import SearchForm from '@/components/SearchFormMinimalista'
import AIRecommendations from '@/components/AIRecommendations'
import { useTheme } from '@/contexts/ThemeContext'

export default function Home() {
  const { primaryColor } = useTheme()
  const [properties, setProperties] = useState<any[]>([])
  const [filteredProperties, setFilteredProperties] = useState<any[]>([])
  const [propertiesLoading, setPropertiesLoading] = useState(true)
  const [headerSettings, setHeaderSettings] = useState({
    headerTitle: '',
    headerSubtitle: ''
  })

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

    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const data = await response.json()
          if (data && data.settings) {
            setHeaderSettings({
              headerTitle: data.settings.headerTitle || 'Encontre o Imóvel Perfeito no DF',
              headerSubtitle: data.settings.headerSubtitle || 'Casas, apartamentos e coberturas no Distrito Federal'
            })
          }
        }
      } catch (error) {
        console.error('❌ Erro ao carregar configurações:', error)
      }
    }

    loadProperties()
    loadSettings()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        {/* Hero Section com imagem */}
        <section
          className="relative py-12 md:py-20 text-white overflow-hidden"
          style={{
            height: '60vh',
            minHeight: '450px',
            backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('/header-bg.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Conteúdo */}
          <div className="relative z-10 flex items-center justify-center h-full pt-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="hidden md:block text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 leading-tight drop-shadow-lg text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                {headerSettings.headerTitle}
              </h1>
              <p className="hidden md:block text-base sm:text-lg md:text-xl lg:text-2xl mb-8 md:mb-12 px-4 text-white drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
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