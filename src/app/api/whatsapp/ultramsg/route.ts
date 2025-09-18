import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { phone, message, propertyId, contactName } = await request.json()

    // Validações
    if (!phone || !message) {
      return NextResponse.json(
        { error: 'Telefone e mensagem são obrigatórios' },
        { status: 400 }
      )
    }

    // Configurações do UltraMsg
    const instanceId = process.env.ULTRAMSG_INSTANCE_ID
    const token = process.env.ULTRAMSG_TOKEN

    if (!instanceId || !token) {
      console.error('❌ [UltraMsg] Credenciais não configuradas')
      return NextResponse.json(
        { error: 'Configuração do WhatsApp incompleta' },
        { status: 500 }
      )
    }

    // Formatar número de telefone
    let formattedPhone = phone.replace(/\D/g, '') // Remove tudo que não é número
    if (!formattedPhone.startsWith('55')) {
      formattedPhone = '55' + formattedPhone // Adiciona código do Brasil
    }

    console.log(`📱 [UltraMsg] Enviando para: ${formattedPhone}`)
    console.log(`💬 [UltraMsg] Mensagem: ${message.substring(0, 100)}...`)

    // Chamar API do UltraMsg
    const ultraMsgUrl = `https://api.ultramsg.com/${instanceId}/messages/chat`
    const payload = {
      token: token,
      to: formattedPhone,
      body: message,
      priority: 'high'
    }

    const response = await fetch(ultraMsgUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const responseData = await response.json()

    if (response.ok && responseData.sent) {
      // Salvar no banco de dados
      try {
        const whatsappMessage = await prisma.whatsAppMessage.create({
          data: {
            messageId: responseData.id || `ultramsg-${Date.now()}`,
            from: instanceId,
            to: formattedPhone,
            body: message,
            type: 'text',
            timestamp: new Date(),
            fromMe: true,
            status: 'sent',
            source: 'ultramsg_api',
            propertyId: propertyId || null,
            contactName: contactName || null
          }
        })

        console.log('✅ [UltraMsg] Mensagem enviada e salva:', whatsappMessage.id)
      } catch (dbError) {
        console.error('⚠️ [UltraMsg] Erro ao salvar no banco:', dbError)
        // Continua mesmo se falhar no banco
      }

      return NextResponse.json({
        success: true,
        message: 'Mensagem enviada com sucesso',
        messageId: responseData.id,
        phone: formattedPhone,
        timestamp: new Date().toISOString()
      })

    } else {
      console.error('❌ [UltraMsg] Erro na API:', responseData)
      return NextResponse.json(
        {
          success: false,
          error: 'Falha ao enviar mensagem',
          details: responseData.error || 'Erro desconhecido'
        },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('💥 [UltraMsg] Erro geral:', error)
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

// GET para testar a configuração
export async function GET() {
  const instanceId = process.env.ULTRAMSG_INSTANCE_ID
  const token = process.env.ULTRAMSG_TOKEN

  return NextResponse.json({
    configured: !!(instanceId && token),
    instanceId: instanceId ? `${instanceId.substring(0, 8)}...` : 'não configurado',
    endpoint: '/api/whatsapp/ultramsg',
    timestamp: new Date().toISOString()
  })
}