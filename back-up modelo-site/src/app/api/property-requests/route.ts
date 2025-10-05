import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validação básica
    if (!data.clientName || !data.clientEmail || !data.clientPhone || !data.saleType || !data.city) {
      return NextResponse.json({ error: 'Campos obrigatórios não preenchidos' }, { status: 400 })
    }

    // Criar solicitação no banco
    const propertyRequest = await prisma.propertyRequest.create({
      data: {
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        propertyType: data.propertyType || null,
        saleType: data.saleType,
        priceMin: data.priceMin || null,
        priceMax: data.priceMax || null,
        city: data.city,
        neighborhood: data.neighborhood || null,
        bedrooms: data.bedrooms || null,
        bathrooms: data.bathrooms || null,
        parking: data.parking || null,
        areaMin: data.areaMin || null,
        areaMax: data.areaMax || null,
        description: data.description || null,
        timeline: data.timeline || null,
        budget: data.budget || null,
        status: 'ativo'
      }
    })

    console.log('🔍 Nova solicitação de busca:', {
      id: propertyRequest.id,
      cliente: propertyRequest.clientName,
      tipo: propertyRequest.saleType,
      cidade: propertyRequest.city
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Solicitação enviada com sucesso',
      requestId: propertyRequest.id 
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Erro ao criar solicitação de busca:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const requests = await prisma.propertyRequest.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ requests })
  } catch (error) {
    console.error('❌ Erro ao buscar solicitações:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}