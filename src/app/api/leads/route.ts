import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { name, email, phone, message, propertyId, propertyTitle, propertyPrice, propertyType } = body

    // Validação básica
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      )
    }

    // Criar lead no banco
    const lead = await prisma.lead.create({
      data: {
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        message: message?.trim() || null,
        propertyId: propertyId || null,
        propertyTitle: propertyTitle || null,
        propertyPrice: propertyPrice || null,
        propertyType: propertyType || null,
        source: 'site',
        status: 'novo'
      }
    })

    console.log('🏠 Novo lead de imóvel:', {
      id: lead.id,
      nome: lead.name,
      imovel: lead.propertyTitle,
      email: lead.email
    })

    // Enviar notificação via WhatsApp usando UltraMsg
    try {
      const phoneAdmin = process.env.ULTRAMSG_ADMIN_PHONE || '5561996900444'
      const instanceId = process.env.ULTRAMSG_INSTANCE_ID
      const token = process.env.ULTRAMSG_TOKEN

      if (instanceId && token) {
        const whatsappMessage = `🏠 *INTERESSE EM IMÓVEL*

👤 *Nome:* ${lead.name}
📧 *Email:* ${lead.email || 'Não informado'}
📱 *Telefone:* ${lead.phone || 'Não informado'}
🏠 *Imóvel:* ${lead.propertyTitle || 'Não informado'}
💰 *Preço:* ${lead.propertyPrice ? `R$ ${lead.propertyPrice.toLocaleString('pt-BR')}` : 'Não informado'}

💬 *Mensagem:*
${lead.message || 'Demonstrou interesse no imóvel'}

🕐 *Data:* ${new Date().toLocaleString('pt-BR')}
🆔 *Lead ID:* ${lead.id}

#InteresseImovel #LeadQuente`

        const ultraMsgUrl = `https://api.ultramsg.com/${instanceId}/messages/chat`
        const payload = {
          token: token,
          to: phoneAdmin.replace(/\D/g, ''),
          body: whatsappMessage,
          priority: 'high'
        }

        const ultraMsgResponse = await fetch(ultraMsgUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        const responseData = await ultraMsgResponse.json()

        if (ultraMsgResponse.ok && responseData.sent) {
          console.log('✅ WhatsApp enviado para admin (interesse imóvel)')

          // Salvar mensagem no banco
          await prisma.whatsAppMessage.create({
            data: {
              messageId: String(responseData.id) || `lead-${Date.now()}`,
              from: instanceId,
              to: phoneAdmin.replace(/\D/g, ''),
              body: whatsappMessage,
              type: 'text',
              timestamp: new Date(),
              fromMe: true,
              status: 'sent',
              source: 'lead_notification',
              contactName: lead.name,
              propertyId: lead.propertyId
            }
          })
        } else {
          console.error('❌ Falha ao enviar WhatsApp (interesse imóvel):', responseData)
        }
      } else {
        console.log('⚠️ UltraMsg não configurado para interesse em imóvel')
      }

    } catch (whatsappError) {
      console.error('⚠️ Erro ao enviar notificação WhatsApp (interesse):', whatsappError)
      // Não falha o lead se o WhatsApp falhar
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Lead cadastrado com sucesso!',
        leadId: lead.id
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Erro ao criar lead:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Construir filtros
    const where: Record<string, unknown> = {}
    
    if (status && status !== 'all') {
      where.status = status
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { propertyTitle: { contains: search } }
      ]
    }

    // Buscar leads com paginação
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              slug: true,
              type: true,
              price: true
            }
          }
        }
      }),
      prisma.lead.count({ where })
    ])

    // Para cada lead, verificar se há mensagens WhatsApp relacionadas
    const leadsWithWhatsAppStatus = await Promise.all(
      leads.map(async (lead) => {
        if (!lead.phone) return { ...lead, hasWhatsAppMessage: false }

        // Verificar se existe mensagem WhatsApp para este lead
        const whatsappMessage = await prisma.whatsAppMessage.findFirst({
          where: {
            OR: [
              { contactName: { contains: lead.name } },
              {
                AND: [
                  { body: { contains: lead.name } },
                  { fromMe: true }
                ]
              }
            ]
          },
          orderBy: { createdAt: 'desc' }
        })

        return {
          ...lead,
          hasWhatsAppMessage: !!whatsappMessage,
          whatsAppMessageDate: whatsappMessage?.createdAt || null
        }
      })
    )

    return NextResponse.json({
      leads: leadsWithWhatsAppStatus,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Erro ao buscar leads:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}