import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validação básica
    if (!data.ownerName || !data.ownerEmail || !data.ownerPhone || !data.title || !data.propertyType || !data.saleType || !data.address || !data.city || !data.state) {
      return NextResponse.json({ error: 'Campos obrigatórios não preenchidos' }, { status: 400 })
    }

    // Criar submissão no banco
    const submission = await prisma.propertySubmission.create({
      data: {
        ownerName: data.ownerName,
        ownerEmail: data.ownerEmail,
        ownerPhone: data.ownerPhone,
        title: data.title,
        description: data.description || null,
        propertyType: data.propertyType,
        saleType: data.saleType,
        price: data.price || null,
        address: data.address,
        city: data.city,
        state: data.state,
        neighborhood: data.neighborhood || null,
        bedrooms: data.bedrooms || null,
        bathrooms: data.bathrooms || null,
        parking: data.parking || null,
        area: data.area || null,
        hasPhotos: data.hasPhotos || false,
        acceptsVisits: data.acceptsVisits !== false,
        urgency: data.urgency || 'normal',
        status: 'pendente'
      }
    })

    console.log('📝 Nova submissão de imóvel:', {
      id: submission.id,
      proprietario: submission.ownerName,
      tipo: submission.propertyType,
      cidade: submission.city
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Cadastro enviado com sucesso',
      submissionId: submission.id 
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Erro ao criar submissão de imóvel:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const submissions = await prisma.propertySubmission.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ submissions })
  } catch (error) {
    console.error('❌ Erro ao buscar submissões:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}