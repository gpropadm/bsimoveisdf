'use client'

import { useState, useEffect } from 'react'

interface HeaderSettings {
  headerImageUrl: string
  headerTitle: string
  headerSubtitle: string
}

export function useHeaderSettings() {
  const [settings, setSettings] = useState<HeaderSettings>({
    headerImageUrl: '',
    headerTitle: 'Carregando...',
    headerSubtitle: 'Aguarde...'
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        console.log('🔧 Hook: Buscando configurações do header...')
        const response = await fetch('/api/settings', {
          next: { revalidate: 300 } // Cache por 5 minutos
        })
        console.log('📡 Hook: Response status:', response.status)

        if (response.ok) {
          const data = await response.json()
          console.log('📦 Hook: Dados recebidos:', data)

          if (data.settings) {
            const newSettings = {
              headerImageUrl: data.settings.headerImageUrl,
              headerTitle: data.settings.headerTitle,
              headerSubtitle: data.settings.headerSubtitle
            }
            console.log('✅ Hook: Configurações aplicadas:', newSettings)
            console.log('🖼️ Hook: URL da imagem final:', newSettings.headerImageUrl)
            setSettings(newSettings)
          } else {
            console.log('⚠️ Hook: Nenhuma configuração encontrada, usando padrões')
          }
        } else {
          console.error('❌ Hook: Erro HTTP:', response.status)
        }
      } catch (err) {
        console.error('❌ Hook: Erro ao carregar configurações:', err)
        setError('Erro ao carregar configurações')
      } finally {
        console.log('🏁 Hook: Finalizando loading...')
        setLoading(false)
      }
    }

    // Pequeno delay para evitar problemas de hidratação
    const timer = setTimeout(fetchSettings, 100)
    return () => clearTimeout(timer)
  }, [])

  return { settings, loading, error }
}