'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import HeroSection from '@/components/HeroSection'
import PropertyStoriesSection from '@/components/PropertyStoriesSection'
import Footer from '@/components/Footer'
import CadastrarImovelModal from '@/components/CadastrarImovelModal'
import EncomendarImovelModal from '@/components/EncomendarImovelModal'
import ContatoModal from '@/components/ContatoModal'
import { useSettings } from '@/hooks/useSettings'

export default function Home() {
  const [properties, setProperties] = useState<any[]>([])
  const { settings } = useSettings()
  const [propertiesLoading, setPropertiesLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)
  
  // Estados dos modais
  const [showCadastroModal, setShowCadastroModal] = useState(false)
  const [showEncomendaModal, setShowEncomendaModal] = useState(false)
  const [showContatoModal, setShowContatoModal] = useState(false)

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
      <Header settings={settings} />
      
      <main>
        <HeroSection />
        <PropertyStoriesSection 
          properties={properties} 
          loading={propertiesLoading} 
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