import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const data = await request.json()

    const submission = await prisma.propertySubmission.update({
      where: { id },
      data: {
        status: data.status,
        adminNotes: data.adminNotes || undefined,
        updatedAt: new Date()
      }
    })

    console.log('📝 Status da submissão atualizado:', {
      id: submission.id,
      novoStatus: submission.status,
      proprietario: submission.ownerName
    })

    return NextResponse.json({ 
      success: true, 
      submission 
    })

  } catch (error) {
    console.error('❌ Erro ao atualizar submissão:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const submission = await prisma.propertySubmission.findUnique({
      where: { id }
    })

    if (!submission) {
      return NextResponse.json({ 
        error: 'Submissão não encontrada' 
      }, { status: 404 })
    }

    return NextResponse.json({ submission })

  } catch (error) {
    console.error('❌ Erro ao buscar submissão:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}