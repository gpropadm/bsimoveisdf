import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

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
          enableComments: false
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
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { type, settings } = body

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

      return NextResponse.json({ 
        message: 'Configurações salvas com sucesso',
        settings: { site: currentSettings }
      })
    }

    return NextResponse.json({ error: 'Tipo de configuração inválido' }, { status: 400 })
  } catch (error) {
    console.error('Erro ao salvar configurações:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}