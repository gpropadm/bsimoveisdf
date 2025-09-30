import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const leadId = params.id

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

    // Se já tem preferências, não fazer nada
    if (lead.preferredPriceMin && lead.preferredPriceMax) {
      return NextResponse.json({
        message: 'Lead já tem preferências configuradas',
        preferences: {
          priceMin: lead.preferredPriceMin,
          priceMax: lead.preferredPriceMax,
          category: lead.preferredCategory,
          city: lead.preferredCity,
          type: lead.preferredType
        }
      })
    }

    // Buscar o imóvel de interesse para extrair preferências
    if (!lead.propertyId) {
      return NextResponse.json(
        { error: 'Lead não tem imóvel de referência' },
        { status: 400 }
      )
    }

    const property = await prisma.property.findUnique({
      where: { id: lead.propertyId }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Imóvel de referência não encontrado' },
        { status: 404 }
      )
    }

    // Calcular preferências baseadas no imóvel de interesse
    const priceVariation = property.price * 0.2
    const preferredData = {
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

    // Atualizar o lead com as preferências
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: preferredData
    })

    console.log(`✅ Preferências extraídas para lead ${lead.name}:`, preferredData)

    return NextResponse.json({
      success: true,
      message: 'Preferências extraídas com sucesso',
      lead: {
        id: updatedLead.id,
        name: updatedLead.name
      },
      preferences: preferredData
    })

  } catch (error) {
    console.error('❌ Erro ao extrair preferências:', error)
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}