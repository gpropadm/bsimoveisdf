import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const { status, notes } = body

    // Validar status
    const validStatuses = ['novo', 'contatado', 'interessado', 'convertido', 'perdido']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Status inválido' },
        { status: 400 }
      )
    }

    // Atualizar lead
    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      lead: updatedLead 
    })

  } catch (error) {
    console.error('Erro ao atualizar lead:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Lead não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.lead.delete({
      where: { id }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Lead excluído com sucesso' 
    })

  } catch (error) {
    console.error('Erro ao excluir lead:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Lead não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            slug: true,
            type: true,
            price: true,
            category: true,
            address: true
          }
        }
      }
    })

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ lead })

  } catch (error) {
    console.error('Erro ao buscar lead:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}