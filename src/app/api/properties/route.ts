import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Cache em memória AGRESSIVO para performance
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos - cache mais longo

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured')
    const limit = searchParams.get('limit')
    const type = searchParams.get('type') // venda ou aluguel
    const category = searchParams.get('category') // casa, apartamento, etc
    const city = searchParams.get('city')
    const state = searchParams.get('state')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const minArea = searchParams.get('minArea')
    const maxArea = searchParams.get('maxArea')
    const bedrooms = searchParams.get('bedrooms')
    const bathrooms = searchParams.get('bathrooms')

    // Criar chave de cache baseada nos parâmetros (versão 2 com novos campos)
    const cacheKey = `v2-${featured}-${limit}-${type}-${category}-${city}-${state}-${minPrice}-${maxPrice}-${minArea}-${maxArea}-${bedrooms}-${bathrooms}`
    const cached = cache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data)
    }

    let where: any = {
      status: 'disponivel'
    }

    if (featured === 'true') {
      where.featured = true
    }

    if (type) {
      where.type = type
    }

    if (category) {
      where.category = category
    }

    if (city) {
      // Normalizar busca para lidar com acentos e variações
      const normalizedCity = city.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos

      // Variações comuns (águas/aguas)
      const cityVariations = []
      if (normalizedCity.includes('aguas')) {
        cityVariations.push('águas')
        cityVariations.push('aguas')
      }
      if (normalizedCity.includes('agua')) {
        cityVariations.push('água')
        cityVariations.push('agua')
      }

      // Busca inteligente: city, title, address e slug
      const searchConditions = [
        {
          city: {
            contains: city,
            mode: 'insensitive'
          }
        },
        {
          title: {
            contains: city,
            mode: 'insensitive'
          }
        },
        {
          title: {
            contains: normalizedCity,
            mode: 'insensitive'
          }
        },
        {
          address: {
            contains: city,
            mode: 'insensitive'
          }
        },
        {
          slug: {
            contains: city,
            mode: 'insensitive'
          }
        }
      ]

      // Adicionar variações específicas para todos os campos
      cityVariations.forEach(variation => {
        searchConditions.push(
          {
            title: {
              contains: variation,
              mode: 'insensitive'
            }
          },
          {
            address: {
              contains: variation,
              mode: 'insensitive'
            }
          },
          {
            slug: {
              contains: variation,
              mode: 'insensitive'
            }
          }
        )
      })

      where.OR = searchConditions
    }

    if (state) {
      where.state = {
        contains: state,
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
        area: true,
        images: true,
        featured: true,
        condoFee: true,
        latitude: true,
        longitude: true,
        description: true,
        createdAt: true,
        // Campos específicos para apartamentos
        suites: true,
        apartmentTotalArea: true,
        apartmentUsefulArea: true,
        parking: true,
        // Campo de vídeo
        video: true
      }
    })

    // Parse das imagens de string JSON para array e converter Decimal para number
    const parsedProperties = properties.map(property => ({
      ...property,
      images: property.images ? JSON.parse(property.images) : [],
      latitude: property.latitude ? Number(property.latitude) : null,
      longitude: property.longitude ? Number(property.longitude) : null
    }))

    // Armazenar no cache
    cache.set(cacheKey, {
      data: parsedProperties,
      timestamp: Date.now()
    })

    return NextResponse.json(parsedProperties)

  } catch (error) {
    console.error('Erro ao buscar propriedades:', error)
    return NextResponse.json([])
  }
}