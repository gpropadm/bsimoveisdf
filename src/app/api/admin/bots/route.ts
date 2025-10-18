import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

// GET - Listar todos os bots
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const bots = await prisma.bot.findMany({
      include: {
        _count: {
          select: {
            sessions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(bots)
  } catch (error) {
    console.error('Erro ao buscar bots:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar bots' },
      { status: 500 }
    )
  }
}

// POST - Criar novo bot
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      description,
      type,
      template,
      channels,
      aiProvider,
      aiModel,
      systemPrompt,
      autoCreateLead,
      autoAssignBroker
    } = body

    if (!name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    const bot = await prisma.bot.create({
      data: {
        name,
        description: description || null,
        type: type || 'assistido',
        template: template || null,
        active: true,
        channels: typeof channels === 'string' ? channels : JSON.stringify(channels || ['whatsapp']),
        aiProvider: aiProvider || 'anthropic',
        aiModel: aiModel || 'claude-sonnet-4-5-20250929',
        systemPrompt: systemPrompt || null,
        autoCreateLead: autoCreateLead !== undefined ? autoCreateLead : true,
        autoAssignBroker: autoAssignBroker !== undefined ? autoAssignBroker : false
      }
    })

    return NextResponse.json(bot, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar bot:', error)
    return NextResponse.json(
      { error: 'Erro ao criar bot' },
      { status: 500 }
    )
  }
}
