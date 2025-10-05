import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validação básica
    if (!data.name || !data.email || !data.subject || !data.message) {
      return NextResponse.json({ error: 'Campos obrigatórios não preenchidos' }, { status: 400 })
    }

    // Criar mensagem no banco
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        subject: data.subject,
        message: data.message,
        source: 'site',
        referrer: request.headers.get('referer') || null,
        status: 'novo'
      }
    })

    console.log('💬 Nova mensagem de contato:', {
      id: contactMessage.id,
      nome: contactMessage.name,
      assunto: contactMessage.subject,
      email: contactMessage.email
    })

    // Enviar notificação via WhatsApp usando UltraMsg
    try {
      const phoneAdmin = process.env.ULTRAMSG_ADMIN_PHONE || '5561996900444'
      const whatsappMessage = `🏠 *NOVA MENSAGEM DE CONTATO*

👤 *Nome:* ${data.name}
📧 *Email:* ${data.email}
📱 *Telefone:* ${data.phone || 'Não informado'}
📋 *Assunto:* ${data.subject}

💬 *Mensagem:*
${data.message}

🌐 *Origem:* ${request.headers.get('referer') || 'Site'}
🕐 *Data:* ${new Date().toLocaleString('pt-BR')}

#ContatoSite #Lead`

      // Chamar API do UltraMsg diretamente
      const instanceId = process.env.ULTRAMSG_INSTANCE_ID
      const token = process.env.ULTRAMSG_TOKEN

      if (instanceId && token) {
        const ultraMsgUrl = `https://api.ultramsg.com/${instanceId}/messages/chat`
        const payload = {
          token: token,
          to: phoneAdmin.replace(/\D/g, ''), // Remove formatação
          body: whatsappMessage,
          priority: 'high'
        }

        const ultraMsgResponse = await fetch(ultraMsgUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        const responseData = await ultraMsgResponse.json()

        console.log('📊 [UltraMsg] Resposta completa:', {
          status: ultraMsgResponse.status,
          ok: ultraMsgResponse.ok,
          data: responseData
        })

        if (ultraMsgResponse.ok && responseData.sent) {
          console.log('✅ Notificação WhatsApp enviada para admin:', responseData.id)

          // Salvar mensagem no banco
          await prisma.whatsAppMessage.create({
            data: {
              messageId: responseData.id ? String(responseData.id) : `contact-${Date.now()}`,
              from: instanceId,
              to: phoneAdmin.replace(/\D/g, ''),
              body: whatsappMessage,
              type: 'text',
              timestamp: new Date(),
              fromMe: true,
              status: 'sent',
              source: 'contact_notification',
              contactName: data.name
            }
          })
        } else {
          console.error('❌ Falha ao enviar WhatsApp:', responseData)
        }
      } else {
        console.log('⚠️ UltraMsg não configurado')
      }

    } catch (whatsappError) {
      console.error('⚠️ Erro ao enviar notificação WhatsApp:', whatsappError)
      // Não falha o contato se o WhatsApp falhar
    }

    return NextResponse.json({
      success: true,
      message: 'Mensagem enviada com sucesso',
      messageId: contactMessage.id
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Erro ao criar mensagem de contato:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('❌ Erro ao buscar mensagens:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}