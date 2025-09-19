import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET - Buscar imóvel específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const property = await prisma.property.findUnique({
      where: { id }
    })

    if (!property) {
      return NextResponse.json({ error: 'Imóvel não encontrado' }, { status: 404 })
    }


    return NextResponse.json(property)
  } catch (error) {
    console.error('Erro ao buscar imóvel:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT - Atualizar imóvel
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      address,
      city,
      state,
      price,
      type,
      category,
      bedrooms,
      bathrooms,
      parking,
      area,
      video,
      featured,
      images,
      // Campos específicos para fazenda
      totalArea,
      cultivatedArea,
      pastures,
      areaUnit,
      buildings,
      waterSources,
      // Campos específicos para apartamento
      floor,
      condoFee,
      amenities,
      // Campos específicos para terreno
      zoning,
      slope,
      frontage,
      // Campos específicos para casa
      houseType,
      yard,
      garage,
      // Campos específicos para comercial
      commercialType,
      floor_commercial,
      businessCenter,
      features
    } = body

    console.log('🎬 Dados de vídeo recebidos na API:', video)
    console.log('🎬 Tipo do dado de vídeo:', typeof video)

    // Verificar se o imóvel existe
    const { id } = await params
    const existingProperty = await prisma.property.findUnique({
      where: { id }
    })

    if (!existingProperty) {
      return NextResponse.json({ error: 'Imóvel não encontrado' }, { status: 404 })
    }

    // Gerar novo slug se o título mudou
    let slug = existingProperty.slug
    if (title !== existingProperty.title) {
      slug = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()

      // Verificar se o slug já existe
      const existingSlug = await prisma.property.findFirst({
        where: { 
          slug,
          id: { not: id }
        }
      })

      if (existingSlug) {
        slug = `${slug}-${Date.now()}`
      }
    }

    console.log('🔧 Dados para update:', {
      buildings: typeof buildings,
      amenities: typeof amenities,
      features: typeof features,
      totalArea: typeof totalArea,
      yard: typeof yard
    })

    const updateData: any = {
      title,
      description,
      address,
      city,
      state,
      price,
      type,
      category,
      bedrooms,
      bathrooms,
      parking,
      area,
      video,
      featured,
      images,
      slug
    }

    // Adicionar campos opcionais apenas se não forem undefined
    if (totalArea !== undefined) updateData.totalArea = totalArea
    if (cultivatedArea !== undefined) updateData.cultivatedArea = cultivatedArea
    if (pastures !== undefined) updateData.pastures = pastures
    if (areaUnit !== undefined) updateData.areaUnit = areaUnit
    if (buildings !== undefined) updateData.buildings = buildings
    if (waterSources !== undefined) updateData.waterSources = waterSources
    if (floor !== undefined) updateData.floor = floor
    if (condoFee !== undefined) updateData.condoFee = condoFee
    if (amenities !== undefined) updateData.amenities = amenities
    if (zoning !== undefined) updateData.zoning = zoning
    if (slope !== undefined) updateData.slope = slope
    if (frontage !== undefined) updateData.frontage = frontage
    if (houseType !== undefined) updateData.houseType = houseType
    if (yard !== undefined) updateData.yard = yard
    if (garage !== undefined) updateData.garage = garage
    if (commercialType !== undefined) updateData.commercialType = commercialType
    if (floor_commercial !== undefined) updateData.floor_commercial = floor_commercial
    if (businessCenter !== undefined) updateData.businessCenter = businessCenter
    if (features !== undefined) updateData.features = features

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(updatedProperty)
  } catch (error) {
    console.error('Erro ao atualizar imóvel:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PATCH - Atualizar campos específicos
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Campos que podem ser atualizados via PATCH
    const allowedFields = ['status', 'featured']
    const updateData: any = {}

    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Nenhum campo válido para atualizar' },
        { status: 400 }
      )
    }

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      property: updatedProperty
    })

  } catch (error) {
    console.error('Erro ao atualizar propriedade:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir imóvel
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o imóvel existe
    const { id } = await params
    const existingProperty = await prisma.property.findUnique({
      where: { id }
    })

    if (!existingProperty) {
      return NextResponse.json({ error: 'Imóvel não encontrado' }, { status: 404 })
    }

    await prisma.property.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Imóvel excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir imóvel:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}