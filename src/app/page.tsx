'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import HeroSection from '@/components/HeroSection'
import FeaturedPropertiesSection from '@/components/FeaturedPropertiesSection'
import ServicesSection from '@/components/ServicesSection'
import Footer from '@/components/Footer'
import CadastrarImovelModal from '@/components/CadastrarImovelModal'
import EncomendarImovelModal from '@/components/EncomendarImovelModal'
import ContatoModal from '@/components/ContatoModal'
import { useSettings } from '@/hooks/useSettings'

export default function Home() {
  const [properties, setProperties] = useState<any[]>([])
  const { settings } = useSettings()
  const [loading, setLoading] = useState(true)
  
  // Estados dos modais
  const [showCadastroModal, setShowCadastroModal] = useState(false)
  const [showEncomendaModal, setShowEncomendaModal] = useState(false)
  const [showContatoModal, setShowContatoModal] = useState(false)

  useEffect(() => {
    const loadProperties = async () => {
      try {
        // Carregar propriedades
        const propertiesResponse = await fetch('/api/properties?featured=true')
        if (propertiesResponse.ok) {
          const propertiesData = await propertiesResponse.json()
          setProperties(propertiesData || [])
        }
      } catch (error) {
        console.error('❌ Erro ao carregar dados:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProperties()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <Header settings={settings} />
      
      <main>
        <HeroSection />
        <FeaturedPropertiesSection properties={properties} loading={loading} />
        <ServicesSection 
          onCadastroClick={() => setShowCadastroModal(true)}
          onEncomendaClick={() => setShowEncomendaModal(true)}
          onContatoClick={() => setShowContatoModal(true)}
        />
      </main>

      <Footer />

      {/* Modais */}
      <CadastrarImovelModal 
        isOpen={showCadastroModal} 
        onClose={() => setShowCadastroModal(false)} 
      />
      <EncomendarImovelModal 
        isOpen={showEncomendaModal} 
        onClose={() => setShowEncomendaModal(false)} 
      />
      <ContatoModal 
        isOpen={showContatoModal} 
        onClose={() => setShowContatoModal(false)} 
      />
    </div>
  )
}