import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured')
    const limit = searchParams.get('limit')
    const type = searchParams.get('type') // venda ou aluguel
    const category = searchParams.get('category') // casa, apartamento, etc

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
        createdAt: true
      }
    })

    // Parse das imagens de string JSON para array
    const parsedProperties = properties.map(property => ({
      ...property,
      images: property.images ? JSON.parse(property.images) : []
    }))

    return NextResponse.json(parsedProperties)

  } catch (error) {
    console.error('Erro ao buscar propriedades:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}