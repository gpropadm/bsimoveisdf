import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { name, phone, propertyId } = await request.json()

    // Validar dados obrigatórios
    if (!name || !phone || !propertyId) {
      return NextResponse.json(
        { error: 'Nome, telefone e ID do imóvel são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o imóvel existe
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Imóvel não encontrado' },
        { status: 404 }
      )
    }

    // Criar ou atualizar alerta de preço
    const priceAlert = await prisma.priceAlert.upsert({
      where: {
        propertyId_phone: {
          propertyId,
          phone
        }
      },
      update: {
        name,
        active: true
      },
      create: {
        name,
        phone,
        propertyId,
        active: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Alerta cadastrado com sucesso!',
      alertId: priceAlert.id
    })

  } catch (error) {
    console.error('Erro ao criar alerta de preço:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')
    const phone = searchParams.get('phone')

    if (!propertyId || !phone) {
      return NextResponse.json(
        { error: 'ID do imóvel e telefone são obrigatórios' },
        { status: 400 }
      )
    }

    // Desativar alerta
    await prisma.priceAlert.updateMany({
      where: {
        propertyId,
        phone
      },
      data: {
        active: false
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Alerta desativado com sucesso!'
    })

  } catch (error) {
    console.error('Erro ao desativar alerta de preço:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}