import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const cache = new Map()
const CACHE_TTL = 60 * 1000 // 60 segundos

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const city = searchParams.get('city')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const minArea = searchParams.get('minArea')
    const maxArea = searchParams.get('maxArea')
    const bedrooms = searchParams.get('bedrooms')
    const bathrooms = searchParams.get('bathrooms')
    const limit = searchParams.get('limit')

    // Criar chave de cache baseada nos parâmetros
    const cacheKey = `aluguel-${category}-${city}-${minPrice}-${maxPrice}-${minArea}-${maxArea}-${bedrooms}-${bathrooms}-${limit}`
    const cached = cache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data)
    }

    let where: any = {
      status: 'disponivel',
      type: 'aluguel'
    }

    if (category) {
      where.category = category
    }

    if (city) {
      where.city = {
        contains: city,
        mode: 'insensitive'
      }
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseInt(minPrice)
      if (maxPrice) where.price.lte = parseInt(maxPrice)
    }

    if (minArea || maxArea) {
      where.area = {}
      if (minArea) where.area.gte = parseInt(minArea)
      if (maxArea) where.area.lte = parseInt(maxArea)
    }

    if (bedrooms) {
      where.bedrooms = parseInt(bedrooms)
    }

    if (bathrooms) {
      where.bathrooms = parseInt(bathrooms)
    }

    const properties = await prisma.property.findMany({
      where,
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit ? parseInt(limit) : undefined,
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        type: true,
        category: true,
        address: true,
        city: true,
        state: true,
        bedrooms: true,
        bathrooms: true,
        parking: true,
        area: true,
        images: true,
        featured: true,
        condoFee: true,
        latitude: true,
        longitude: true,
        description: true,
        createdAt: true
      }
    })

    // Parse das imagens de string JSON para array e converter Decimal para number
    const parsedProperties = properties.map(property => ({
      ...property,
      images: property.images ? JSON.parse(property.images) : [],
      latitude: property.latitude ? Number(property.latitude) : null,
      longitude: property.longitude ? Number(property.longitude) : null
    }))

    const response = {
      properties: parsedProperties,
      total: parsedProperties.length
    }

    // Armazenar no cache
    cache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    })

    return NextResponse.json(response)

  } catch (error) {
    console.error('Erro ao buscar propriedades de aluguel:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', properties: [] },
      { status: 500 }
    )
  }
}