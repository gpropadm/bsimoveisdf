import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Cache em memória
let cachedSettings: any = null
let cacheTimestamp = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

// Função para limpar o cache (exportada para ser usada por outras rotas)
export function clearSettingsCache() {
  cachedSettings = null
  cacheTimestamp = 0
}

// GET público - Buscar configurações (sem autenticação)
export async function GET() {
  try {
    // Verificar cache
    if (cachedSettings && Date.now() - cacheTimestamp < CACHE_TTL) {
      return NextResponse.json({ settings: cachedSettings })
    }

    // Buscar configurações do banco de dados
    const settings = await prisma.settings.findFirst({
      orderBy: { createdAt: 'asc' }
    })

    console.log('🔍 [API] Settings encontradas:', settings ? 'SIM' : 'NÃO')

    if (settings) {
      // Atualizar cache
      cachedSettings = settings
      cacheTimestamp = Date.now()

      return NextResponse.json({ settings })
    }

    // Se não existir, retornar valores padrão
    const defaultSettings = {
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
      headerImageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      headerTitle: 'Encontre o Imóvel Perfeito',
      headerSubtitle: 'Casas, apartamentos e terrenos dos seus sonhos',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return NextResponse.json({ settings: defaultSettings })
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
      enableComments: false,
      headerImageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      headerTitle: 'Encontre o Imóvel Perfeito',
      headerSubtitle: 'Casas, apartamentos e terrenos dos seus sonhos'
    }
    
    return NextResponse.json({ settings: defaultSettings })
  }
}