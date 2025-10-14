import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { clearSettingsCache } from '@/app/api/settings/route'

// GET - Buscar configurações
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar configurações do banco de dados
    let settings = await prisma.settings.findFirst({
      orderBy: { createdAt: 'asc' }
    })
    
    // Se não existir, criar com valores padrão
    if (!settings) {
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
          enableComments: false,
          headerImageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
          headerTitle: 'Encontre o Imóvel Perfeito',
          headerSubtitle: 'Casas, apartamentos e terrenos dos seus sonhos'
        }
      })
    }

    return NextResponse.json({ site: settings })
  } catch (error) {
    console.error('Erro ao buscar configurações:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Salvar configurações
export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Iniciando salvamento de configurações...')
    console.log('🍪 Headers:', Object.fromEntries(request.headers.entries()))

    const session = await getServerSession(authOptions)
    console.log('👤 Session encontrada:', session ? 'SIM' : 'NÃO')
    console.log('📋 Session details:', JSON.stringify(session, null, 2))

    if (!session) {
      console.log('❌ Usuário não autenticado')
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    console.log('📦 Body recebido:', JSON.stringify(body, null, 2))

    const { type, settings } = body

    if (!settings) {
      console.log('❌ Settings não fornecido no body')
      return NextResponse.json({ error: 'Configurações não fornecidas' }, { status: 400 })
    }

    if (type === 'site') {
      // Buscar configuração existente ou criar nova
      let currentSettings = await prisma.settings.findFirst({
        orderBy: { createdAt: 'asc' }
      })

      if (currentSettings) {
        // Atualizar configuração existente
        currentSettings = await prisma.settings.update({
          where: { id: currentSettings.id },
          data: settings
        })
      } else {
        // Criar nova configuração
        currentSettings = await prisma.settings.create({
          data: settings
        })
      }

      // Limpar o cache das configurações públicas
      clearSettingsCache()
      console.log('✅ Cache de configurações limpo')

      return NextResponse.json({
        message: 'Configurações salvas com sucesso',
        settings: { site: currentSettings }
      })
    }

    return NextResponse.json({ error: 'Tipo de configuração inválido' }, { status: 400 })
  } catch (error) {
    console.error('Erro ao salvar configurações:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return NextResponse.json({
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}