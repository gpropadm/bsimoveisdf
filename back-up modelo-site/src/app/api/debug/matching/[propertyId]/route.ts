import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: { propertyId: string } }) {
  try {
    const propertyId = params.propertyId

    // Buscar o imóvel
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    })

    if (!property) {
      return NextResponse.json({ error: 'Imóvel não encontrado' }, { status: 404 })
    }

    console.log('🏠 Imóvel para matching:', {
      id: property.id,
      title: property.title,
      price: property.price,
      type: property.type,
      category: property.category,
      city: property.city
    })

    // Buscar leads potenciais (mesma query da API original)
    const potentialLeads = await prisma.lead.findMany({
      where: {
        AND: [
          { enableMatching: true },
          { phone: { not: null } },
          { status: { in: ['novo', 'interessado', 'perdido', 'contatado'] } },
          {
            OR: [
              { preferredType: property.type },
              { propertyType: property.type },
              { AND: [{ preferredType: null }, { propertyType: null }] }
            ]
          },
          {
            OR: [
              { preferredCategory: property.category },
              { preferredCategory: null }
            ]
          },
          {
            OR: [
              { preferredCity: property.city },
              { preferredCity: null }
            ]
          }
        ]
      }
    })

    console.log(`🎯 Encontrados ${potentialLeads.length} leads potenciais`)

    const leadAnalysis = []

    for (const lead of potentialLeads) {
      let matchScore = 0
      const matchReasons = []
      const debugInfo = []

      // Debug preço
      const priceDebug = checkPriceMatchDebug(lead, property)
      if (priceDebug.matches) {
        matchScore += 30
        matchReasons.push(priceDebug.reason)
      }
      debugInfo.push(`Preço: ${priceDebug.debug}`)

      // Debug categoria
      if (lead.preferredCategory === property.category) {
        matchScore += 25
        matchReasons.push(`Categoria: ${property.category}`)
        debugInfo.push(`Categoria: ✅ ${property.category}`)
      } else {
        debugInfo.push(`Categoria: ❌ ${lead.preferredCategory} != ${property.category}`)
      }

      // Debug cidade
      if (lead.preferredCity === property.city) {
        matchScore += 20
        matchReasons.push(`Cidade: ${property.city}`)
        debugInfo.push(`Cidade: ✅ ${property.city}`)
      } else {
        debugInfo.push(`Cidade: ❌ ${lead.preferredCity} != ${property.city}`)
      }

      leadAnalysis.push({
        lead: {
          id: lead.id,
          name: lead.name,
          phone: lead.phone,
          status: lead.status,
          enableMatching: lead.enableMatching,
          preferredPriceMin: lead.preferredPriceMin,
          preferredPriceMax: lead.preferredPriceMax,
          preferredCategory: lead.preferredCategory,
          preferredCity: lead.preferredCity,
          preferredType: lead.preferredType
        },
        matchScore,
        matchReasons,
        debugInfo,
        isMatch: matchScore >= 50
      })
    }

    return NextResponse.json({
      property: {
        id: property.id,
        title: property.title,
        price: property.price,
        type: property.type,
        category: property.category,
        city: property.city
      },
      totalLeads: potentialLeads.length,
      leadAnalysis,
      matches: leadAnalysis.filter(l => l.isMatch).length
    })

  } catch (error) {
    console.error('Erro no debug matching:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

function checkPriceMatchDebug(lead: any, property: any) {
  const propertyPrice = property.price

  // Se o lead tem faixa de preço definida
  if (lead.preferredPriceMin && lead.preferredPriceMax) {
    const min = lead.preferredPriceMin
    const max = lead.preferredPriceMax

    if (propertyPrice >= min && propertyPrice <= max) {
      return {
        matches: true,
        reason: `Preço na faixa: R$ ${propertyPrice.toLocaleString('pt-BR')}`,
        debug: `✅ ${propertyPrice} está entre ${min}-${max}`
      }
    } else {
      return {
        matches: false,
        reason: 'Preço fora da faixa',
        debug: `❌ ${propertyPrice} não está entre ${min}-${max}`
      }
    }
  }

  // Se o lead demonstrou interesse em um imóvel similar (±20%)
  if (lead.propertyPrice) {
    const tolerance = lead.propertyPrice * 0.2
    const minPrice = lead.propertyPrice - tolerance
    const maxPrice = lead.propertyPrice + tolerance

    if (propertyPrice >= minPrice && propertyPrice <= maxPrice) {
      return {
        matches: true,
        reason: `Preço similar ao interesse anterior (±20%)`,
        debug: `✅ ${propertyPrice} está entre ${minPrice}-${maxPrice} (±20% de ${lead.propertyPrice})`
      }
    } else {
      return {
        matches: false,
        reason: 'Preço incompatível',
        debug: `❌ ${propertyPrice} não está entre ${minPrice}-${maxPrice} (±20% de ${lead.propertyPrice})`
      }
    }
  }

  return {
    matches: false,
    reason: 'Sem faixa de preço definida',
    debug: '❌ Lead não tem preferredPriceMin/Max nem propertyPrice'
  }
}