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
      // Usar API pública que não requer autenticação
      const response = await fetch('/api/settings', { 
        cache: 'no-store'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.settings) {
          const newSettings = {
            contactPhone: data.settings.contactPhone || DEFAULT_SETTINGS.contactPhone,
            contactEmail: data.settings.contactEmail || DEFAULT_SETTINGS.contactEmail,
            contactWhatsapp: data.settings.contactWhatsapp || DEFAULT_SETTINGS.contactWhatsapp,
            city: data.settings.city || DEFAULT_SETTINGS.city,
            state: data.settings.state || DEFAULT_SETTINGS.state,
            socialFacebook: data.settings.socialFacebook || DEFAULT_SETTINGS.socialFacebook,
            socialInstagram: data.settings.socialInstagram || DEFAULT_SETTINGS.socialInstagram,
            siteName: data.settings.siteName || DEFAULT_SETTINGS.siteName,
            featuredLimit: data.settings.featuredLimit || DEFAULT_SETTINGS.featuredLimit,
            siteDescription: data.settings.siteDescription || DEFAULT_SETTINGS.siteDescription,
            address: data.settings.address || DEFAULT_SETTINGS.address,
            enableRegistrations: data.settings.enableRegistrations ?? DEFAULT_SETTINGS.enableRegistrations,
            enableComments: data.settings.enableComments ?? DEFAULT_SETTINGS.enableComments
          }
          setSettings(newSettings)
        }
      } else {
        console.log('Using default settings (API not available)')
        setSettings(DEFAULT_SETTINGS)
      }
    } catch (error) {
      console.log('Using default settings due to error:', error)
      setSettings(DEFAULT_SETTINGS)
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

    // Apenas escutar evento customizado para reload imediato das configurações
    const handleSettingsUpdate = () => {
      console.log('🔔 Evento settings-updated recebido! Atualizando configurações...')
      fetchSettings()
    }

    window.addEventListener('settings-updated', handleSettingsUpdate)

    return () => {
      window.removeEventListener('settings-updated', handleSettingsUpdate)
    }
  }, [])

  return { settings, loading, refreshSettings }
}