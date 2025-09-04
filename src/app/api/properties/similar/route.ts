import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const type = searchParams.get('type')
    const exclude = searchParams.get('exclude') // ID do imóvel atual para excluir

    if (!city) {
      return NextResponse.json(
        { error: 'Parâmetro obrigatório: city' },
        { status: 400 }
      )
    }

    // Construir filtros dinamicamente
    const whereClause: any = {
      city: city,
      status: 'disponivel'
    }

    // Adicionar filtro de tipo se fornecido e válido
    if (type && type !== 'undefined') {
      whereClause.type = type
    }

    // Adicionar filtro de preço se fornecido e válido
    if (minPrice && !isNaN(parseFloat(minPrice)) && maxPrice && !isNaN(parseFloat(maxPrice))) {
      whereClause.price = {
        gte: parseFloat(minPrice),
        lte: parseFloat(maxPrice)
      }
    }

    // Excluir o imóvel atual se fornecido
    if (exclude && exclude !== 'undefined') {
      whereClause.id = { not: exclude }
    }

    // Buscar imóveis similares
    const properties = await prisma.property.findMany({
      where: whereClause,
      orderBy: [
        { featured: 'desc' }, // Priorizar imóveis em destaque
        { createdAt: 'desc' }  // Depois por data de criação
      ],
      take: 6 // Limitar a 6 resultados
    })

    return NextResponse.json(properties)
  } catch (error) {
    console.error('Erro ao buscar imóveis similares:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}