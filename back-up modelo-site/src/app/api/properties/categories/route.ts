import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const cache = new Map()
const CACHE_TTL = 300 * 1000 // 5 minutos para categorias (mudam menos frequentemente)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // venda ou aluguel

    // Criar chave de cache baseada no tipo
    const cacheKey = `categories-${type}`
    const cached = cache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data)
    }

    let where: any = {
      status: 'disponivel'
    }

    if (type) {
      where.type = type
    }

    // Buscar categorias distintas para o tipo especificado
    const properties = await prisma.property.findMany({
      where,
      select: {
        category: true
      },
      distinct: ['category']
    })

    // Extrair apenas as categorias únicas e filtrar nulls/vazios
    const categories = properties
      .map(p => p.category)
      .filter(category => category && category.trim() !== '')
      .sort()

    const response = {
      categories,
      type: type || 'all'
    }

    // Armazenar no cache
    cache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    })

    return NextResponse.json(response)

  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', categories: [] },
      { status: 500 }
    )
  }
}