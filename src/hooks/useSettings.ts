'use client'

import { useState, useEffect } from 'react'

interface Settings {
  contactPhone: string
  contactEmail: string
  contactWhatsapp: string
  city: string
  state: string
  socialFacebook: string
  socialInstagram: string
  siteName?: string
  featuredLimit?: number
  siteDescription?: string
  address?: string
  enableRegistrations?: boolean
  enableComments?: boolean
}

const DEFAULT_SETTINGS: Settings = {
  contactPhone: '(48) 99864-5864',
  contactEmail: 'contato@faimoveis.com.br',
  contactWhatsapp: '5548998645864',
  city: 'Florianópolis',
  state: 'SC',
  socialFacebook: 'https://facebook.com',
  socialInstagram: 'https://instagram.com',
  siteName: 'ImobiNext',
  featuredLimit: 6,
  siteDescription: 'Encontre o imóvel dos seus sonhos',
  address: 'Rua das Flores, 123',
  enableRegistrations: true,
  enableComments: false
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  const fetchSettings = async () => {
    try {
      console.log('🔄 Carregando configurações...')
      const response = await fetch('/api/admin/settings?' + new Date().getTime(), { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      if (response.ok) {
        const data = await response.json()
        console.log('📥 Configurações recebidas:', data.site)
        if (data.site) {
          const newSettings = {
            contactPhone: data.site.contactPhone || DEFAULT_SETTINGS.contactPhone,
            contactEmail: data.site.contactEmail || DEFAULT_SETTINGS.contactEmail,
            contactWhatsapp: data.site.contactWhatsapp || DEFAULT_SETTINGS.contactWhatsapp,
            city: data.site.city || DEFAULT_SETTINGS.city,
            state: data.site.state || DEFAULT_SETTINGS.state,
            socialFacebook: data.site.socialFacebook || DEFAULT_SETTINGS.socialFacebook,
            socialInstagram: data.site.socialInstagram || DEFAULT_SETTINGS.socialInstagram,
            siteName: data.site.siteName || DEFAULT_SETTINGS.siteName,
            featuredLimit: data.site.featuredLimit || DEFAULT_SETTINGS.featuredLimit,
            siteDescription: data.site.siteDescription || DEFAULT_SETTINGS.siteDescription,
            address: data.site.address || DEFAULT_SETTINGS.address,
            enableRegistrations: data.site.enableRegistrations ?? DEFAULT_SETTINGS.enableRegistrations,
            enableComments: data.site.enableComments ?? DEFAULT_SETTINGS.enableComments
          }
          console.log('✅ Configurações atualizadas:', newSettings)
          setSettings(newSettings)
        }
      }
    } catch (error) {
      console.error('Erro ao buscar configurações:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshSettings = () => {
    setLoading(true)
    fetchSettings()
  }

  useEffect(() => {
    fetchSettings()

    // Verificar mudanças a cada 30 segundos quando a página está ativa
    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchSettings()
      }
    }, 30000)

    // Escutar eventos de foco na janela para recarregar configurações
    const handleFocus = () => {
      fetchSettings()
    }

    // Escutar evento customizado para reload imediato das configurações
    const handleSettingsUpdate = () => {
      console.log('🔔 Evento settings-updated recebido! Atualizando configurações...')
      fetchSettings()
    }

    window.addEventListener('focus', handleFocus)
    window.addEventListener('settings-updated', handleSettingsUpdate)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('settings-updated', handleSettingsUpdate)
    }
  }, [])

  return { settings, loading, refreshSettings }
}