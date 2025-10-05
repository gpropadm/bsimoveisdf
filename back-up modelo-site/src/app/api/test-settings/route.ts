import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Teste de configurações iniciado')

    const session = await getServerSession(authOptions)
    console.log('👤 Sessão:', session ? 'autenticado' : 'não autenticado')

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    console.log('📦 Body recebido:', JSON.stringify(body, null, 2))

    const { type, settings } = body

    if (type === 'site') {
      console.log('🔍 Buscando configurações existentes...')

      // Buscar configuração existente
      let currentSettings = await prisma.settings.findFirst({
        orderBy: { createdAt: 'asc' }
      })

      console.log('📋 Configurações encontradas:', currentSettings ? 'sim' : 'não')

      if (currentSettings) {
        console.log('🔄 Atualizando configurações existentes...')
        console.log('💾 Dados para salvar:', JSON.stringify(settings, null, 2))

        // Atualizar configuração existente
        currentSettings = await prisma.settings.update({
          where: { id: currentSettings.id },
          data: settings
        })

        console.log('✅ Configurações atualizadas com sucesso!')
      } else {
        console.log('➕ Criando novas configurações...')

        // Criar nova configuração
        currentSettings = await prisma.settings.create({
          data: settings
        })

        console.log('✅ Configurações criadas com sucesso!')
      }

      return NextResponse.json({
        message: 'Configurações salvas com sucesso',
        settings: { site: currentSettings }
      })
    }

    return NextResponse.json({ error: 'Tipo de configuração inválido' }, { status: 400 })
  } catch (error) {
    console.error('❌ Erro ao salvar configurações:', error)
    console.error('🔍 Error stack:', error instanceof Error ? error.stack : 'No stack')
    console.error('📋 Error message:', error instanceof Error ? error.message : 'No message')

    return NextResponse.json({
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : 'No stack'
    }, { status: 500 })
  }
}