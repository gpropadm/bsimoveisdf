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

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        title,
        description,
        address,
        city,
        state,
        price,
        type,
        category,
        bedrooms: bedrooms || null,
        bathrooms: bathrooms || null,
        parking: parking || null,
        area: area || null,
        video,
        featured,
        images,
        slug,
        // Campos específicos para fazenda
        totalArea: totalArea || null,
        cultivatedArea: cultivatedArea || null,
        pastures: pastures || null,
        areaUnit,
        buildings,
        waterSources,
        // Campos específicos para apartamento
        floor: floor || null,
        condoFee: condoFee || null,
        amenities,
        // Campos específicos para terreno
        zoning,
        slope,
        frontage: frontage || null,
        // Campos específicos para casa
        houseType,
        yard,
        garage,
        // Campos específicos para comercial
        commercialType,
        floor_commercial: floor_commercial || null,
        businessCenter,
        features
      }
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