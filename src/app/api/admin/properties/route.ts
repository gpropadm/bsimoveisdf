import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit')

    const properties = await prisma.property.findMany({
      take: limit ? parseInt(limit) : undefined,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        cep: true,
        address: true,
        city: true,
        state: true,
        price: true,
        type: true,
        category: true,
        bedrooms: true,
        bathrooms: true,
        parking: true,
        area: true,
        video: false, // Não carregar vídeo na listagem para performance
        featured: true,
        images: false, // Não carregar imagens na listagem para performance
        // Campos específicos para apartamentos
        floor: true,
        condoFee: true,
        amenities: true,
        // Campos específicos para terrenos
        zoning: true,
        slope: true,
        frontage: true,
        // Campos específicos para fazendas
        totalArea: true,
        cultivatedArea: true,
        pastures: true,
        buildings: true,
        waterSources: true,
        // Campos específicos para casas
        houseType: true,
        yard: true,
        garage: true,
        // Campos específicos para comerciais
        commercialType: true,
        floor_commercial: true,
        businessCenter: true,
        features: true,
        createdAt: true,
      }
    })

    return NextResponse.json({ properties })
  } catch (error) {
    console.error('Error fetching properties:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      price,
      type,
      category,
      cep,
      address,
      city,
      state,
      bedrooms,
      bathrooms,
      parking,
      area,
      video,
      featured,
      images,
      // Campos específicos para apartamentos
      floor,
      condoFee,
      amenities,
      // Campos específicos para terrenos
      zoning,
      slope,
      frontage,
      // Campos específicos para fazendas
      totalArea,
      cultivatedArea,
      pastures,
      buildings,
      waterSources,
      // Campos específicos para casas
      houseType,
      yard,
      garage,
      // Campos específicos para comerciais
      commercialType,
      floor_commercial,
      businessCenter,
      features
    } = body

    // Criar slug a partir do título
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplos
      .trim()

    // Verificar se o slug já existe e adicionar número se necessário
    let finalSlug = slug
    let counter = 1
    while (await prisma.property.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${counter}`
      counter++
    }

    const property = await prisma.property.create({
      data: {
        title,
        slug: finalSlug,
        description: description || null,
        price,
        type,
        category,
        cep: cep || null,
        address,
        city,
        state,
        bedrooms: bedrooms || null,
        bathrooms: bathrooms || null,
        parking: parking || null,
        area: area || null,
        video: video || null,
        featured: featured || false,
        images: images || null,
        // Campos específicos para apartamentos
        floor: floor || null,
        condoFee: condoFee || null,
        amenities: amenities || null,
        // Campos específicos para terrenos
        zoning: zoning || null,
        slope: slope || null,
        frontage: frontage || null,
        // Campos específicos para fazendas
        totalArea: totalArea || null,
        cultivatedArea: cultivatedArea || null,
        pastures: pastures || null,
        buildings: buildings || null,
        waterSources: waterSources || null,
        // Campos específicos para casas
        houseType: houseType || null,
        yard: yard || null,
        garage: garage || null,
        // Campos específicos para comerciais
        commercialType: commercialType || null,
        floor_commercial: floor_commercial || null,
        businessCenter: businessCenter || null,
        features: features || null,
      }
    })

    return NextResponse.json(property, { status: 201 })
  } catch (error) {
    console.error('Error creating property:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}