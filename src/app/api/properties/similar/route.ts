import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const state = searchParams.get('state')
    const neighborhood = searchParams.get('neighborhood') || searchParams.get('address') // Extrair bairro do endereço
    const price = searchParams.get('price')
    const category = searchParams.get('category')
    const exclude = searchParams.get('exclude')

    if (!city) {
      return NextResponse.json(
        { error: 'Parâmetro obrigatório: city' },
        { status: 400 }
      )
    }

    const currentPrice = price ? parseFloat(price) : 0

    // Extrair bairro do endereço se fornecido
    const extractNeighborhood = (address: string) => {
      if (!address) return null
      // Tentar extrair bairro do endereço (assumindo formato "Rua X, Bairro, Cidade")
      const parts = address.split(',').map(part => part.trim())
      return parts.length >= 2 ? parts[parts.length - 2] : null
    }

    const currentNeighborhood = neighborhood ? extractNeighborhood(neighborhood) : null

    let finalProperties: any[] = []

    // CRITÉRIOS OBRIGATÓRIOS: Mesma categoria, mesmo estado, mesma cidade/bairro, faixa de preço ±30%
    if (category && state && city && currentPrice > 0) {
      console.log(`Buscando propriedades similares para: categoria=${category}, estado=${state}, cidade=${city}, preço=R$${currentPrice.toLocaleString('pt-BR')}`)

      // NÍVEL 1: Mesmo bairro + categoria + estado + cidade + preço ±30%
      if (currentNeighborhood) {
        const neighborhoodProperties = await prisma.property.findMany({
          where: {
            category: category, // OBRIGATÓRIO: mesma categoria
            state: state, // OBRIGATÓRIO: mesmo estado
            city: city, // OBRIGATÓRIO: mesma cidade
            address: { contains: currentNeighborhood, mode: 'insensitive' }, // Mesmo bairro
            price: {
              gte: currentPrice * 0.7, // -30%
              lte: currentPrice * 1.3  // +30%
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

        finalProperties = [...finalProperties, ...neighborhoodProperties]
        console.log(`Nível 1 - Bairro "${currentNeighborhood}" | Estado "${state}" | Cidade "${city}": ${neighborhoodProperties.length} imóveis`)
      }

      // NÍVEL 2: Mesma cidade + categoria + estado + preço ±30%
      if (finalProperties.length < 6) {
        const excludeIds = finalProperties.map(p => p.id).concat(exclude ? [exclude] : [])

        const cityProperties = await prisma.property.findMany({
          where: {
            category: category, // OBRIGATÓRIO: mesma categoria
            state: state, // OBRIGATÓRIO: mesmo estado
            city: city, // OBRIGATÓRIO: mesma cidade
            price: {
              gte: currentPrice * 0.7, // -30%
              lte: currentPrice * 1.3  // +30%
            },
            status: 'disponivel',
            id: { notIn: excludeIds }
          },
          orderBy: [
            { featured: 'desc' },
            { createdAt: 'desc' }
          ],
          take: 6 - finalProperties.length
        })

        finalProperties = [...finalProperties, ...cityProperties]
        console.log(`Nível 2 - Estado "${state}" | Cidade "${city}": ${cityProperties.length} imóveis adicionais`)
      }

      // NÍVEL 3: Mesma categoria + estado + cidade (sem filtro de preço)
      if (finalProperties.length < 6) {
        const excludeIds = finalProperties.map(p => p.id).concat(exclude ? [exclude] : [])

        const categoryProperties = await prisma.property.findMany({
          where: {
            category: category, // OBRIGATÓRIO: mesma categoria
            state: state, // OBRIGATÓRIO: mesmo estado
            city: city, // OBRIGATÓRIO: mesma cidade
            status: 'disponivel',
            id: { notIn: excludeIds }
          },
          orderBy: [
            { featured: 'desc' },
            { createdAt: 'desc' }
          ],
          take: 6 - finalProperties.length
        })

        finalProperties = [...finalProperties, ...categoryProperties]
        console.log(`Nível 3 - Categoria "${category}" | Estado "${state}" | Cidade "${city}" (sem filtro preço): ${categoryProperties.length} imóveis`)
      }

      // NÍVEL 4: Mesma categoria + estado (outras cidades do mesmo estado)
      if (finalProperties.length < 6) {
        const excludeIds = finalProperties.map(p => p.id).concat(exclude ? [exclude] : [])

        const stateProperties = await prisma.property.findMany({
          where: {
            category: category, // OBRIGATÓRIO: mesma categoria
            state: state, // OBRIGATÓRIO: mesmo estado
            city: { not: city }, // Outras cidades do estado
            status: 'disponivel',
            id: { notIn: excludeIds }
          },
          orderBy: [
            { featured: 'desc' },
            { createdAt: 'desc' }
          ],
          take: 6 - finalProperties.length
        })

        finalProperties = [...finalProperties, ...stateProperties]
        console.log(`Nível 4 - Categoria "${category}" | Estado "${state}" (outras cidades): ${stateProperties.length} imóveis`)
      }
    } else {
      console.log('Parâmetros insuficientes para busca de propriedades similares:', { category, state, city, currentPrice })
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