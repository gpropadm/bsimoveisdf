import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

// GET - Buscar leads agrupados por stage (para o Kanban)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar todos os stages ativos
    const stages = await prisma.leadStage.findMany({
      where: { active: true },
      orderBy: { order: 'asc' }
    })

    // Buscar leads para cada stage
    const kanbanData = await Promise.all(
      stages.map(async (stage) => {
        const leads = await prisma.lead.findMany({
          where: { currentStage: stage.id },
          orderBy: { stageUpdatedAt: 'desc' },
          include: {
            property: {
              select: {
                id: true,
                title: true,
                price: true,
                type: true,
                images: true
              }
            }
          }
        })

        return {
          stage,
          leads
        }
      })
    )

    return NextResponse.json(kanbanData)
  } catch (error) {
    console.error('Erro ao buscar dados do Kanban:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar dados do Kanban' },
      { status: 500 }
    )
  }
}

// POST - Mover lead de stage (Drag & Drop)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { leadId, fromStageId, toStageId, reason, notes } = body

    if (!leadId || !toStageId) {
      return NextResponse.json(
        { error: 'leadId e toStageId são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar lead atual
    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 })
    }

    const previousStage = lead.currentStage
    const stageChangedAt = lead.stageUpdatedAt

    // Calcular tempo no stage anterior (em minutos)
    const duration = Math.floor(
      (new Date().getTime() - new Date(stageChangedAt).getTime()) / (1000 * 60)
    )

    // Atualizar lead com novo stage
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        currentStage: toStageId,
        stageUpdatedAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Criar registro no histórico
    await prisma.leadHistory.create({
      data: {
        leadId,
        fromStage: previousStage,
        toStage: toStageId,
        changedBy: session.user?.id || null,
        changedByName: session.user?.name || 'Sistema',
        reason: reason || null,
        notes: notes || null,
        duration
      }
    })

    // TODO: Executar ações automáticas do stage (auto actions)
    // Exemplo: enviar email, criar tarefa, notificar corretor

    return NextResponse.json(updatedLead)
  } catch (error) {
    console.error('Erro ao mover lead:', error)
    return NextResponse.json(
      { error: 'Erro ao mover lead' },
      { status: 500 }
    )
  }
}
