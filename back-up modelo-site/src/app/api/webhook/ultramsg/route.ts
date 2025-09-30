import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Interface para o webhook do UltraMsg
interface UltraMsgWebhook {
  id: string
  body: string
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact'
  timestamp: number
  from: string
  to: string
  author?: string
  fromMe: boolean
  quotedMsgId?: string
  quotedMsgBody?: string
  caption?: string
  ack?: number // 0=sent, 1=delivered, 2=read, 3=failed
}

export async function POST(request: NextRequest) {
  try {
    const webhook: UltraMsgWebhook = await request.json()

    console.log('📨 [UltraMsg Webhook] Recebido:', {
      type: webhook.type,
      from: webhook.from,
      fromMe: webhook.fromMe,
      body: webhook.body?.substring(0, 100) + '...',
      ack: webhook.ack
    })

    // Só processar mensagens recebidas (não enviadas por nós)
    if (!webhook.fromMe && webhook.body) {
      try {
        // Salvar mensagem recebida no banco
        const messageReceived = await prisma.whatsAppMessage.create({
          data: {
            messageId: webhook.id,
            from: webhook.from,
            to: webhook.to,
            body: webhook.body,
            type: webhook.type,
            timestamp: new Date(webhook.timestamp * 1000),
            fromMe: false,
            source: 'ultramsg_webhook'
          }
        })

        console.log('✅ [UltraMsg Webhook] Mensagem salva no banco:', messageReceived.id)

        // Log para debug
        console.log(`📱 MENSAGEM RECEBIDA DE ${webhook.from}:`, webhook.body)

        return NextResponse.json({
          success: true,
          message: 'Webhook processado com sucesso',
          messageId: messageReceived.id
        })

      } catch (dbError) {
        console.error('❌ [UltraMsg Webhook] Erro ao salvar no banco:', dbError)
        // Retorna sucesso mesmo se falhar no banco para não fazer o UltraMsg reenviar
        return NextResponse.json({
          success: true,
          message: 'Webhook recebido (erro no banco)',
          error: 'Database error'
        })
      }
    }

    // Processar ACKs (confirmações de entrega/leitura)
    if (webhook.ack !== undefined) {
      const statusMap = {
        0: 'sent',
        1: 'delivered',
        2: 'read',
        3: 'failed'
      }

      const status = statusMap[webhook.ack as keyof typeof statusMap] || 'unknown'

      console.log(`📋 [UltraMsg ACK] Mensagem ${webhook.id}: ${status}`)

      // Atualizar status no banco se existir
      try {
        await prisma.whatsAppMessage.updateMany({
          where: { messageId: webhook.id },
          data: { status }
        })
      } catch (error) {
        console.error('❌ [UltraMsg ACK] Erro ao atualizar status:', error)
      }
    }

    return NextResponse.json({ success: true, message: 'Webhook processado' })

  } catch (error) {
    console.error('💥 [UltraMsg Webhook] Erro geral:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET para verificar se o webhook está funcionando
export async function GET() {
  return NextResponse.json({
    message: 'UltraMsg Webhook está funcionando',
    timestamp: new Date().toISOString(),
    endpoint: '/api/webhook/ultramsg'
  })
}