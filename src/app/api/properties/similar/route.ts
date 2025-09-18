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

      // PRIORIDADE 1: Verificar se existem imóveis no mesmo bairro
      if (currentNeighborhood) {
        // Buscar TODOS os imóveis do mesmo bairro + categoria (sem limite de preço primeiro)
        const neighborhoodCheck = await prisma.property.findMany({
          where: {
            category: category, // OBRIGATÓRIO: mesma categoria
            state: state, // OBRIGATÓRIO: mesmo estado
            city: city, // OBRIGATÓRIO: mesma cidade
            address: { contains: currentNeighborhood, mode: 'insensitive' }, // Mesmo bairro
            status: 'disponivel',
            id: { not: exclude || undefined }
          },
          orderBy: [
            { featured: 'desc' },
            { createdAt: 'desc' }
          ]
        })

        console.log(`Verificação bairro "${currentNeighborhood}": ${neighborhoodCheck.length} imóveis encontrados`)

        // Se tem mais de 1 imóvel no mesmo bairro, mostrar APENAS esses
        if (neighborhoodCheck.length > 0) {
          console.log(`✅ Usando apenas imóveis do bairro "${currentNeighborhood}" (${neighborhoodCheck.length} encontrados)`)
          finalProperties = neighborhoodCheck.slice(0, 6)
        }
      }

      // PRIORIDADE 2: Se não tem imóveis no mesmo bairro OU não tem bairro, buscar na cidade
      if (finalProperties.length === 0) {
        console.log(`⚠️ Sem imóveis no bairro específico, expandindo para cidade "${city}"`)

        // Buscar com preço ±30%
        const cityPropertiesWithPrice = await prisma.property.findMany({
          where: {
            category: category, // OBRIGATÓRIO: mesma categoria
            state: state, // OBRIGATÓRIO: mesmo estado
            city: city, // OBRIGATÓRIO: mesma cidade
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

        finalProperties = [...finalProperties, ...cityPropertiesWithPrice]
        console.log(`Cidade "${city}" com preço similar: ${cityPropertiesWithPrice.length} imóveis`)

        // Se ainda não tem o suficiente, buscar sem filtro de preço
        if (finalProperties.length < 6) {
          const excludeIds = finalProperties.map(p => p.id).concat(exclude ? [exclude] : [])

          const cityPropertiesAll = await prisma.property.findMany({
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

          finalProperties = [...finalProperties, ...cityPropertiesAll]
          console.log(`Cidade "${city}" todos os preços: ${cityPropertiesAll.length} imóveis adicionais`)
        }

        // PRIORIDADE 3: Se ainda não tem o suficiente, expandir para outras cidades do estado
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
          console.log(`Estado "${state}" outras cidades: ${stateProperties.length} imóveis`)
        }
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