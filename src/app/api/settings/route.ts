import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET público - Buscar configurações (sem autenticação)
export async function GET() {
  try {
    // Buscar configurações do banco de dados
    let settings = await prisma.settings.findFirst({
      orderBy: { createdAt: 'asc' }
    })
    
    // Se não existir, retornar valores padrão
    if (!settings) {
      settings = {
        id: 'default',
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
        enableComments: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Erro ao buscar configurações:', error)
    
    // Em caso de erro, retornar configurações padrão
    const defaultSettings = {
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
    
    return NextResponse.json({ settings: defaultSettings })
  }
}