import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('📧 [API Leads] Recebendo dados...')

    const body = await request.json()
    console.log('📧 [API Leads] Dados recebidos:', {
      name: body.name,
      email: body.email,
      phone: body.phone,
      propertyId: body.propertyId,
      hasMessage: !!body.message
    })

    const { name, email, phone, message, propertyId, propertyTitle, propertyPrice, propertyType, source, preferredCategory, preferredType, preferredCity, preferredState, preferredPriceMin, preferredPriceMax, enableMatching } = body

    // Validação básica
    if (!name || name.trim() === '') {
      console.log('❌ [API Leads] Nome obrigatório')
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      )
    }

    // Se há interesse em um imóvel específico, extrair preferências
    let preferredData = {}
    if (propertyId) {
      try {
        const property = await prisma.property.findUnique({
          where: { id: propertyId }
        })

        if (property) {
          // Definir faixa de preço baseada no imóvel de interesse (±20%)
          const priceVariation = property.price * 0.2
          preferredData = {
            preferredPriceMin: Math.max(0, property.price - priceVariation),
            preferredPriceMax: property.price + priceVariation,
            preferredCategory: property.category,
            preferredCity: property.city,
            preferredState: property.state,
            preferredBedrooms: property.bedrooms,
            preferredBathrooms: property.bathrooms,
            preferredType: property.type,
            enableMatching: true
          }

          console.log('🎯 Preferências extraídas do imóvel de interesse:', preferredData)
        }
      } catch (error) {
        console.error('Erro ao extrair preferências do imóvel:', error)
      }
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
        source: source || 'site',
        status: 'novo',
        ...preferredData,
        // Se vier preferências diretas do body, sobrescrever
        ...(preferredCategory && { preferredCategory }),
        ...(preferredType && { preferredType }),
        ...(preferredCity && { preferredCity }),
        ...(preferredState && { preferredState }),
        ...(preferredPriceMin && { preferredPriceMin }),
        ...(preferredPriceMax && { preferredPriceMax }),
        ...(enableMatching !== undefined && { enableMatching })
      }
    })

    console.log('✅ [API Leads] Lead criado com sucesso:', {
      id: lead.id,
      nome: lead.name,
      imovel: lead.propertyTitle,
      email: lead.email,
      preferenciasExtraidas: Object.keys(preferredData).length > 0
    })

    // Enviar notificação via WhatsApp usando UltraMsg
    try {
      const phoneAdmin = process.env.ULTRAMSG_ADMIN_PHONE || '5561996900444'
      const instanceId = process.env.ULTRAMSG_INSTANCE_ID
      const token = process.env.ULTRAMSG_TOKEN

      if (instanceId && token) {
        // Buscar dados completos do imóvel para pegar a imagem
        let propertyImage = null
        let fullProperty = null

        if (propertyId) {
          try {
            fullProperty = await prisma.property.findUnique({
              where: { id: propertyId }
            })

            if (fullProperty && fullProperty.images) {
              const images = JSON.parse(fullProperty.images)
              if (Array.isArray(images) && images.length > 0) {
                propertyImage = images[0] // Primeira imagem (principal)
              }
            }
          } catch (error) {
            console.log('⚠️ Erro ao buscar imagem do imóvel:', error)
          }
        }

        // Mensagem mais natural como se fosse o cliente falando
        const clientMessage = lead.message || `Olá! Tenho interesse no imóvel "${lead.propertyTitle}". Gostaria de mais informações.`

        const whatsappMessage = `*NOVO LEAD INTERESSADO*

*Cliente:* ${lead.name}
*WhatsApp:* ${lead.phone || 'Não informado'}
*Email:* ${lead.email || 'Não informado'}

*Imóvel de interesse:*
${lead.propertyTitle || 'Não informado'}
*Valor:* ${lead.propertyPrice ? `R$ ${lead.propertyPrice.toLocaleString('pt-BR')}` : 'Não informado'}

*Mensagem do cliente:*
"${clientMessage}"

*Recebido em:* ${new Date().toLocaleString('pt-BR')}
*Lead ID:* ${lead.id}`

        // Função para normalizar telefone
        function normalizePhoneNumber(phone: string): string {
          const cleanPhone = phone.replace(/\D/g, '')
          if (cleanPhone.length === 13 && cleanPhone.startsWith('55')) return cleanPhone
          if (cleanPhone.length === 11) return '55' + cleanPhone
          if (cleanPhone.length === 10) return '55' + cleanPhone.substring(0, 2) + '9' + cleanPhone.substring(2)
          return cleanPhone
        }

        const normalizedAdminPhone = normalizePhoneNumber(phoneAdmin)

        let ultraMsgResponse

        // Se tem imagem, enviar como mídia com caption
        if (propertyImage) {
          console.log('Enviando lead com imagem do imóvel:', propertyImage)

          const mediaUrl = `https://api.ultramsg.com/${instanceId}/messages/image`
          const mediaPayload = {
            token: token,
            to: normalizedAdminPhone,
            image: propertyImage,
            caption: whatsappMessage,
            priority: 'high'
          }

          ultraMsgResponse = await fetch(mediaUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mediaPayload)
          })
        } else {
          // Sem imagem, enviar só texto
          console.log('Enviando lead sem imagem (só texto)')

          const textUrl = `https://api.ultramsg.com/${instanceId}/messages/chat`
          const textPayload = {
            token: token,
            to: normalizedAdminPhone,
            body: whatsappMessage,
            priority: 'high'
          }

          ultraMsgResponse = await fetch(textUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(textPayload)
          })
        }

        const responseData = await ultraMsgResponse.json()

        if (ultraMsgResponse.ok && responseData.sent) {
          console.log('✅ WhatsApp enviado para admin (interesse imóvel)')

          // Salvar mensagem no banco
          await prisma.whatsAppMessage.create({
            data: {
              messageId: String(responseData.id) || `lead-${Date.now()}`,
              from: instanceId,
              to: normalizedAdminPhone,
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
    console.error('❌ [API Leads] Erro ao criar lead:', error)
    console.error('❌ [API Leads] Stack:', error instanceof Error ? error.stack : 'N/A')
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
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
              price: true,
              images: true
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