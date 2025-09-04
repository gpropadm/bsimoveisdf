import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured')
    const limit = searchParams.get('limit')
    const type = searchParams.get('type')
    const city = searchParams.get('city')
    
    // Construir filtros
    const where: any = {
      status: 'disponivel'
    }
    
    if (featured === 'true') {
      where.featured = true
    }
    
    if (type) {
      where.type = type
    }
    
    if (city) {
      where.city = {
        contains: city,
        mode: 'insensitive'
      }
    }
    
    // Construir query
    const queryOptions: any = {
      where,
      orderBy: {
        createdAt: 'desc'
      }
    }
    
    if (limit) {
      queryOptions.take = parseInt(limit)
    } else if (featured === 'true') {
      queryOptions.take = 6
    }
    
    const properties = await prisma.property.findMany(queryOptions)
    
    // Formatar dados para o frontend
    const formattedProperties = properties.map(property => ({
      id: property.id,
      title: property.title,
      slug: property.slug,
      type: property.type,
      category: property.category,
      price: property.price,
      city: property.city,
      neighborhood: property.city,
      address: property.address,
      state: property.state,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      parking: property.parking,
      area: property.area,
      video: property.video,
      featured: property.featured,
      status: property.status,
      images: property.images ? JSON.parse(property.images) : [],
      createdAt: property.createdAt,
      updatedAt: property.updatedAt
    }))
    
    return NextResponse.json(formattedProperties)
    
  } catch (error) {
    console.error('Erro ao buscar propriedades:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}