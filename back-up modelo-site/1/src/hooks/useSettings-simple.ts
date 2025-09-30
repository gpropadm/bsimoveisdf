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
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Dados fixos para não quebrar
    const defaultSettings: Settings = {
      contactPhone: '(48) 99864-5864',
      contactEmail: 'contato@faimoveis.com.br',
      contactWhatsapp: '5548998645864',
      city: 'Florianópolis',
      state: 'SC',
      socialFacebook: 'https://facebook.com',
      socialInstagram: 'https://instagram.com',
      siteName: 'FA IMÓVEIS'
    }

    setSettings(defaultSettings)
    setLoading(false)
  }, [])

  return { settings, loading }
}