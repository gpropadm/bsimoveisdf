import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const neighborhood = searchParams.get('neighborhood') || searchParams.get('address') // Extrair bairro do endereço
    const price = searchParams.get('price')
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const bedrooms = searchParams.get('bedrooms')
    const exclude = searchParams.get('exclude')

    if (!city) {
      return NextResponse.json(
        { error: 'Parâmetro obrigatório: city' },
        { status: 400 }
      )
    }

    const currentPrice = price ? parseFloat(price) : 0
    const currentBedrooms = bedrooms ? parseInt(bedrooms) : 0

    // Extrair bairro do endereço se fornecido
    const extractNeighborhood = (address: string) => {
      if (!address) return null
      // Tentar extrair bairro do endereço (assumindo formato "Rua X, Bairro, Cidade")
      const parts = address.split(',').map(part => part.trim())
      return parts.length >= 2 ? parts[parts.length - 2] : null
    }

    const currentNeighborhood = neighborhood ? extractNeighborhood(neighborhood) : null

    let finalProperties: any[] = []

    // NÍVEL 1: Máxima Relevância (mesma cidade, bairro, tipo, categoria, faixa de preço ±20%)
    if (finalProperties.length < 6 && currentNeighborhood && currentPrice > 0) {
      const level1Properties = await prisma.property.findMany({
        where: {
          city: city,
          address: { contains: currentNeighborhood, mode: 'insensitive' },
          type: type || undefined,
          category: category || undefined,
          price: {
            gte: currentPrice * 0.8,
            lte: currentPrice * 1.2
          },
          status: 'disponivel',
          id: { not: exclude || undefined }
        },
        orderBy: [
          { featured: 'desc' },
          { createdAt: 'desc' }
        ],
        take: 6
      })

      finalProperties = [...finalProperties, ...level1Properties]
      console.log(`Nível 1 (bairro + categoria): ${level1Properties.length} imóveis`)
    }

    // NÍVEL 2: Alta Relevância (mesma cidade, tipo, faixa de preço ±40%, quartos similares)
    if (finalProperties.length < 6 && currentPrice > 0) {
      const excludeIds = finalProperties.map(p => p.id).concat(exclude ? [exclude] : [])

      const level2Properties = await prisma.property.findMany({
        where: {
          city: city,
          type: type || undefined,
          price: {
            gte: currentPrice * 0.6,
            lte: currentPrice * 1.4
          },
          bedrooms: currentBedrooms > 0 ? {
            gte: Math.max(1, currentBedrooms - 1),
            lte: currentBedrooms + 1
          } : undefined,
          status: 'disponivel',
          id: { notIn: excludeIds }
        },
        orderBy: [
          { featured: 'desc' },
          { createdAt: 'desc' }
        ],
        take: 6 - finalProperties.length
      })

      finalProperties = [...finalProperties, ...level2Properties]
      console.log(`Nível 2 (cidade + quartos): ${level2Properties.length} imóveis`)
    }

    // NÍVEL 3: Relevância Moderada (mesma cidade, mesmo tipo, qualquer preço)
    if (finalProperties.length < 6) {
      const excludeIds = finalProperties.map(p => p.id).concat(exclude ? [exclude] : [])

      const level3Properties = await prisma.property.findMany({
        where: {
          city: city,
          type: type || undefined,
          status: 'disponivel',
          id: { notIn: excludeIds }
        },
        orderBy: [
          { featured: 'desc' },
          { createdAt: 'desc' }
        ],
        take: 6 - finalProperties.length
      })

      finalProperties = [...finalProperties, ...level3Properties]
      console.log(`Nível 3 (cidade geral): ${level3Properties.length} imóveis`)
    }

    // NÍVEL 4: Fallback Final (mesma cidade, qualquer tipo)
    if (finalProperties.length < 6) {
      const excludeIds = finalProperties.map(p => p.id).concat(exclude ? [exclude] : [])

      const level4Properties = await prisma.property.findMany({
        where: {
          city: city,
          status: 'disponivel',
          id: { notIn: excludeIds }
        },
        orderBy: [
          { featured: 'desc' },
          { createdAt: 'desc' }
        ],
        take: 6 - finalProperties.length
      })

      finalProperties = [...finalProperties, ...level4Properties]
      console.log(`Nível 4 (cidade fallback): ${level4Properties.length} imóveis`)
    }

    console.log(`Total de imóveis similares encontrados: ${finalProperties.length}`)

    return NextResponse.json(finalProperties.slice(0, 6))
  } catch (error) {
    console.error('Erro ao buscar imóveis similares:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}