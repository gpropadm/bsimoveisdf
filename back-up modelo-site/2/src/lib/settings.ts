import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface SiteSettings {
  siteName: string
  siteDescription: string
  contactEmail: string
  contactPhone: string
  contactWhatsapp: string
  address: string
  city: string
  state: string
  socialFacebook: string
  socialInstagram: string
  socialLinkedin?: string
  featuredLimit: number
  enableRegistrations: boolean
  enableComments: boolean
}

export async function getSettings(): Promise<SiteSettings> {
  try {
    // Buscar SOMENTE do banco de dados
    let settings = await prisma.settings.findFirst()
    
    // Se não existir configuração, criar uma nova com valores padrão
    if (!settings) {
      console.log('Criando configuração inicial no banco de dados')
      settings = await prisma.settings.create({
        data: {
          siteName: 'ImobiNext',
          siteDescription: 'Encontre o imóvel dos seus sonhos',
          contactEmail: 'contato@imobinext.com',
          contactPhone: '(48) 99864-5864',
          contactWhatsapp: '5548998645864',
          address: 'Rua das Flores, 123',
          city: 'Florianópolis',
          state: 'SC',
          socialFacebook: 'https://facebook.com',
          socialInstagram: 'https://instagram.com',
          socialLinkedin: 'https://linkedin.com',
          featuredLimit: 6,
          enableRegistrations: true,
          enableComments: false
        }
      })
    }

    console.log('✅ Configurações carregadas do banco:', { 
      featuredLimit: settings.featuredLimit,
      id: settings.id 
    })
    
    return {
      siteName: settings.siteName,
      siteDescription: settings.siteDescription,
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      contactWhatsapp: settings.contactWhatsapp,
      address: settings.address,
      city: settings.city,
      state: settings.state,
      socialFacebook: settings.socialFacebook,
      socialInstagram: settings.socialInstagram,
      socialLinkedin: settings.socialLinkedin,
      featuredLimit: settings.featuredLimit,
      enableRegistrations: settings.enableRegistrations,
      enableComments: settings.enableComments
    }
  } catch (error) {
    console.error('❌ Erro ao carregar configurações do banco:', error)
    
    // Configurações padrão como último recurso
    console.log('Usando configurações padrão de fallback')
    return {
      siteName: 'ImobiNext',
      siteDescription: 'Encontre o imóvel dos seus sonhos',
      contactEmail: 'contato@imobinext.com',
      contactPhone: '(48) 99864-5864',
      contactWhatsapp: '5548998645864',
      address: 'Rua das Flores, 123',
      city: 'Florianópolis',
      state: 'SC',
      socialFacebook: 'https://facebook.com',
      socialInstagram: 'https://instagram.com',
      socialLinkedin: 'https://linkedin.com',
      featuredLimit: 6,
      enableRegistrations: true,
      enableComments: false
    }
  }
}