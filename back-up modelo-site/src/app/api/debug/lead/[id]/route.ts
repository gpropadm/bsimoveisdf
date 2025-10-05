import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const leadId = params.id

    // Buscar o lead com todos os campos
    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 })
    }

    // Buscar imóveis disponíveis para comparar
    const availableProperties = await prisma.property.findMany({
      where: { status: 'disponivel' },
      select: {
        id: true,
        title: true,
        price: true,
        type: true,
        category: true,
        city: true,
        state: true,
        bedrooms: true,
        bathrooms: true
      },
      take: 10,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      lead: {
        id: lead.id,
        name: lead.name,
        phone: lead.phone,
        status: lead.status,
        enableMatching: lead.enableMatching,
        propertyId: lead.propertyId,
        propertyTitle: lead.propertyTitle,
        propertyPrice: lead.propertyPrice,
        propertyType: lead.propertyType,
        // Preferências extraídas
        preferredPriceMin: lead.preferredPriceMin,
        preferredPriceMax: lead.preferredPriceMax,
        preferredCategory: lead.preferredCategory,
        preferredCity: lead.preferredCity,
        preferredState: lead.preferredState,
        preferredType: lead.preferredType,
        agentProcessed: lead.agentProcessed,
        agentStatus: lead.agentStatus
      },
      availableProperties,
      debug: {
        hasPreferences: !!(lead.preferredPriceMin && lead.preferredPriceMax),
        canReceiveMatching: lead.enableMatching && !!lead.phone && ['novo', 'interessado', 'perdido'].includes(lead.status),
        priceRange: lead.preferredPriceMin && lead.preferredPriceMax
          ? `R$ ${lead.preferredPriceMin.toLocaleString('pt-BR')} - R$ ${lead.preferredPriceMax.toLocaleString('pt-BR')}`
          : 'Não definido'
      }
    })

  } catch (error) {
    console.error('Erro no debug:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}