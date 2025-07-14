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

    if (!city || !minPrice || !maxPrice || !type) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios: city, minPrice, maxPrice, type' },
        { status: 400 }
      )
    }

    // Buscar imóveis similares
    const properties = await prisma.property.findMany({
      where: {
        city: city, // SQLite é case sensitive, mas vamos usar exato
        type: type,
        price: {
          gte: parseFloat(minPrice),
          lte: parseFloat(maxPrice)
        },
        // Excluir o imóvel atual
        ...(exclude && { id: { not: exclude } })
      },
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