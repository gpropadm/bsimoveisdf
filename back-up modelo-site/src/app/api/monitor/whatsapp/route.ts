import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    const expectedAuth = `Bearer ${process.env.AGENT_AUTH_TOKEN}`

    // Verificar autenticação em produção
    if (process.env.NODE_ENV === 'production' && authHeader !== expectedAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔍 [MONITOR] Verificando saúde do WhatsApp...')

    // 1. Verificar configuração
    const config = {
      instanceId: process.env.ULTRAMSG_INSTANCE_ID,
      token: process.env.ULTRAMSG_TOKEN,
      adminPhone: process.env.ULTRAMSG_ADMIN_PHONE
    }

    const configOk = !!(config.instanceId && config.token && config.adminPhone)

    // 2. Testar conectividade com UltraMsg
    let instanceStatus = null
    let instanceError = null

    try {
      const statusUrl = `https://api.ultramsg.com/${config.instanceId}/instance/status?token=${config.token}`
      const response = await fetch(statusUrl, { timeout: 10000 } as any)
      instanceStatus = await response.json()
    } catch (error) {
      instanceError = error instanceof Error ? error.message : 'Connection failed'
    }

    // 3. Verificar mensagens recentes no banco
    const recentMessages = await prisma.whatsAppMessage.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // últimas 24h
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        messageId: true,
        from: true,
        to: true,
        status: true,
        fromMe: true,
        source: true,
        createdAt: true
      }
    })

    // 4. Verificar contatos recentes
    const recentContacts = await prisma.contactMessage.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // últimas 24h
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        subject: true,
        status: true,
        createdAt: true
      }
    })

    // 5. Calcular estatísticas
    const stats = {
      messagesLast24h: recentMessages.length,
      contactsLast24h: recentContacts.length,
      sentMessages: recentMessages.filter(m => m.fromMe && m.status === 'sent').length,
      receivedMessages: recentMessages.filter(m => !m.fromMe).length,
      lastMessage: recentMessages[0]?.createdAt || null,
      lastContact: recentContacts[0]?.createdAt || null
    }

    // 6. Determinar saúde geral
    const health = {
      status: 'unknown',
      issues: [] as string[]
    }

    if (!configOk) {
      health.issues.push('Configuração incompleta')
    }

    if (instanceError) {
      health.issues.push(`Erro de conectividade: ${instanceError}`)
    }

    if (instanceStatus && instanceStatus.status !== 'authenticated') {
      health.issues.push('WhatsApp não autenticado')
    }

    if (stats.messagesLast24h === 0 && stats.contactsLast24h > 0) {
      health.issues.push('Contatos sem envio de WhatsApp')
    }

    health.status = health.issues.length === 0 ? 'healthy' : 'warning'

    const result = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      health,
      config: {
        hasInstanceId: !!config.instanceId,
        hasToken: !!config.token,
        hasAdminPhone: !!config.adminPhone,
        instanceId: config.instanceId?.substring(0, 8) + '...'
      },
      instance: {
        status: instanceStatus,
        error: instanceError
      },
      stats,
      recentMessages: recentMessages.slice(0, 3), // só primeiras 3
      recentContacts: recentContacts.slice(0, 3)   // só primeiros 3
    }

    console.log('📊 [MONITOR] Resultado:', {
      health: health.status,
      issues: health.issues.length,
      messages24h: stats.messagesLast24h,
      contacts24h: stats.contactsLast24h
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error('💥 [MONITOR] Erro:', error)
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      health: { status: 'error', issues: ['Monitor failed'] },
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}