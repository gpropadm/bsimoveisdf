import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const leadId = params.id

    console.log('🔍 Buscando sugestões para lead perdido:', leadId)

    // Buscar o lead
    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    })

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se tem preferências para buscar sugestões
    if (!lead.enableMatching) {
      return NextResponse.json(
        { message: 'Lead optou por não receber sugestões' },
        { status: 200 }
      )
    }

    if (!lead.phone) {
      return NextResponse.json(
        { message: 'Lead não tem WhatsApp para envio' },
        { status: 200 }
      )
    }

    console.log('🎯 Preferências do lead:', {
      priceMin: lead.preferredPriceMin,
      priceMax: lead.preferredPriceMax,
      category: lead.preferredCategory,
      city: lead.preferredCity,
      type: lead.preferredType
    })

    // Buscar imóveis compatíveis (excluindo o que ele já demonstrou interesse)
    const compatibleProperties = await prisma.property.findMany({
      where: {
        AND: [
          { status: 'disponivel' },
          { id: { not: lead.propertyId } }, // Exclui o imóvel original
          {
            OR: [
              { type: lead.preferredType },
              { type: lead.propertyType },
              { AND: [{ type: null }, { type: null }] }
            ]
          },
          {
            OR: [
              { category: lead.preferredCategory },
              { category: null }
            ]
          },
          {
            OR: [
              { city: lead.preferredCity },
              { city: null }
            ]
          },
          // Filtro de preço
          lead.preferredPriceMin && lead.preferredPriceMax ? {
            price: {
              gte: lead.preferredPriceMin,
              lte: lead.preferredPriceMax
            }
          } : {}
        ]
      },
      take: 5, // Máximo 5 sugestões
      orderBy: { createdAt: 'desc' }
    })

    console.log(`✅ Encontrados ${compatibleProperties.length} imóveis compatíveis`)

    if (compatibleProperties.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nenhum imóvel compatível encontrado',
        suggestions: 0
      })
    }

    // Enviar sugestões via WhatsApp
    const whatsappResult = await sendSuggestionsWhatsApp(lead, compatibleProperties)

    // Atualizar status do lead
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        agentProcessed: true,
        agentStatus: whatsappResult.success ? 'suggestions_sent' : 'suggestions_error',
        agentProcessedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: `${compatibleProperties.length} sugestões enviadas via WhatsApp`,
      suggestions: compatibleProperties.length,
      whatsappSent: whatsappResult.success,
      details: compatibleProperties.map(p => ({
        id: p.id,
        title: p.title,
        price: p.price,
        city: p.city
      }))
    })

  } catch (error) {
    console.error('❌ Erro ao enviar sugestões:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

function normalizePhoneNumber(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '')
  if (cleanPhone.length === 13 && cleanPhone.startsWith('55')) return cleanPhone
  if (cleanPhone.length === 11) return '55' + cleanPhone
  if (cleanPhone.length === 10) return '55' + cleanPhone.substring(0, 2) + '9' + cleanPhone.substring(2)
  return cleanPhone
}

async function sendSuggestionsWhatsApp(lead: any, properties: any[]) {
  try {
    const instanceId = process.env.ULTRAMSG_INSTANCE_ID
    const token = process.env.ULTRAMSG_TOKEN

    if (!instanceId || !token) {
      throw new Error('UltraMsg não configurado')
    }

    const normalizedPhone = normalizePhoneNumber(lead.phone)
    const optOutUrl = `${process.env.NEXTAUTH_URL}/opt-out/${lead.id}`

    // Criar lista de sugestões
    const suggestionsList = properties.map((prop, index) =>
      `${index + 1}. *${prop.title}*
   Preço: R$ ${prop.price.toLocaleString('pt-BR')}
   Local: ${prop.city}, ${prop.state}
   Ver: ${process.env.NEXTAUTH_URL}/imovel/${prop.slug}`
    ).join('\n\n')

    const whatsappMessage = `*OUTRAS OPÇÕES PARA VOCÊ*

Olá *${lead.name}*!

Vimos que você demonstrou interesse no imóvel "${lead.propertyTitle}".

Temos outras opções que podem te interessar na mesma faixa de preço e localização:

${suggestionsList}

*Gostaria de agendar uma visita?*
Responda esta mensagem ou ligue para nós!

---
Para não receber mais sugestões: ${optOutUrl}

BS Imóveis DF`

    console.log(`📱 Enviando sugestões para ${lead.name}:`, {
      original: lead.phone,
      normalizado: normalizedPhone,
      sugestoes: properties.length
    })

    const ultraMsgUrl = `https://api.ultramsg.com/${instanceId}/messages/chat`
    const payload = {
      token: token,
      to: normalizedPhone,
      body: whatsappMessage,
      priority: 'high'
    }

    const response = await fetch(ultraMsgUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const responseData = await response.json()

    if (response.ok && responseData.sent) {
      console.log(`✅ Sugestões enviadas para ${lead.name}`)

      // Salvar no banco
      await prisma.whatsAppMessage.create({
        data: {
          messageId: String(responseData.id) || `suggestions-${Date.now()}`,
          from: instanceId,
          to: normalizedPhone,
          body: whatsappMessage,
          type: 'text',
          timestamp: new Date(),
          fromMe: true,
          status: 'sent',
          source: 'lead_suggestions',
          contactName: lead.name
        }
      })

      return {
        success: true,
        messageId: responseData.id
      }

    } else {
      console.error(`❌ Falha ao enviar sugestões para ${lead.name}:`, responseData)
      return {
        success: false,
        error: responseData
      }
    }

  } catch (error) {
    console.error(`⚠️ Erro ao enviar sugestões para ${lead.name}:`, error)
    return {
      success: false,
      error: error.message
    }
  }
}