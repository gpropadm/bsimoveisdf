import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { propertyId, liked } = await request.json()

    if (!propertyId || typeof liked !== 'boolean') {
      return NextResponse.json(
        { error: 'propertyId e liked são obrigatórios' },
        { status: 400 }
      )
    }

    // Pega IP do usuário
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Verifica se já votou
    const existingVote = await prisma.videoLike.findUnique({
      where: {
        propertyId_ipAddress: {
          propertyId,
          ipAddress
        }
      }
    })

    if (existingVote) {
      // Atualiza voto existente
      const updated = await prisma.videoLike.update({
        where: { id: existingVote.id },
        data: { liked }
      })

      // Retorna contadores atualizados
      const stats = await getStats(propertyId)
      return NextResponse.json({ success: true, vote: updated, stats })
    } else {
      // Cria novo voto
      const vote = await prisma.videoLike.create({
        data: {
          propertyId,
          ipAddress,
          userAgent,
          liked
        }
      })

      // Retorna contadores atualizados
      const stats = await getStats(propertyId)
      return NextResponse.json({ success: true, vote, stats }, { status: 201 })
    }
  } catch (error) {
    console.error('Erro ao salvar like:', error)
    return NextResponse.json(
      { error: 'Erro ao processar voto' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')

    if (!propertyId) {
      return NextResponse.json(
        { error: 'propertyId é obrigatório' },
        { status: 400 }
      )
    }

    // Retorna estatísticas
    const stats = await getStats(propertyId)

    // Verifica se usuário já votou
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'

    const userVote = await prisma.videoLike.findUnique({
      where: {
        propertyId_ipAddress: {
          propertyId,
          ipAddress
        }
      }
    })

    return NextResponse.json({
      stats,
      userVote: userVote ? { liked: userVote.liked } : null
    })
  } catch (error) {
    console.error('Erro ao buscar likes:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

async function getStats(propertyId: string) {
  const likes = await prisma.videoLike.count({
    where: { propertyId, liked: true }
  })

  const dislikes = await prisma.videoLike.count({
    where: { propertyId, liked: false }
  })

  return { likes, dislikes, total: likes + dislikes }
}
