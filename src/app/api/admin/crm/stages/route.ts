import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

// GET - Listar todos os stages
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const stages = await prisma.leadStage.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
      include: {
        leadHistory: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    // Contar leads por stage
    const stagesWithCount = await Promise.all(
      stages.map(async (stage) => {
        const leadsCount = await prisma.lead.count({
          where: { currentStage: stage.id }
        })
        return {
          ...stage,
          leadsCount
        }
      })
    )

    return NextResponse.json(stagesWithCount)
  } catch (error) {
    console.error('Erro ao buscar stages:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar stages' },
      { status: 500 }
    )
  }
}

// POST - Criar novo stage
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, color, icon, order, type, autoActions } = body

    if (!name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    const stage = await prisma.leadStage.create({
      data: {
        name,
        description: description || null,
        color: color || '#3B82F6',
        icon: icon || null,
        order: order || 0,
        type: type || 'active',
        autoActions: autoActions ? JSON.stringify(autoActions) : null,
      }
    })

    return NextResponse.json(stage, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar stage:', error)
    return NextResponse.json(
      { error: 'Erro ao criar stage' },
      { status: 500 }
    )
  }
}
