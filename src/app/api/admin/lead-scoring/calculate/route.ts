import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

// POST - Calcular score de um lead específico
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { leadId } = body

    if (!leadId) {
      return NextResponse.json({ error: 'leadId é obrigatório' }, { status: 400 })
    }

    // Buscar lead
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        property: true
      }
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 })
    }

    // Buscar todas as regras ativas
    const rules = await prisma.leadScoreRule.findMany({
      where: { active: true },
      orderBy: { priority: 'asc' }
    })

    // Calcular pontuação por categoria
    let profileScore = 0
    let engagementScore = 0
    let intentScore = 0
    let matchScore = 0

    const appliedRules = []

    for (const rule of rules) {
      let applies = false

      // Verificar se a regra se aplica
      switch (rule.condition) {
        case 'has_phone':
          applies = !!lead.phone && lead.phone.length > 0
          break

        case 'has_email':
          applies = !!lead.email && lead.email.length > 0
          break

        case 'profile_complete':
          applies = !!lead.name && !!lead.phone && !!lead.email
          break

        case 'has_preferences':
          applies = !!(
            lead.preferredPriceMin ||
            lead.preferredPriceMax ||
            lead.preferredCategory ||
            lead.preferredCity
          )
          break

        case 'chatbot_interaction':
          // TODO: Contar interações do chatbot no histórico
          applies = lead.source === 'chatbot'
          break

        case 'viewed_property':
          applies = !!lead.propertyId
          break

        case 'requested_visit':
          // TODO: Verificar se tem appointment agendado
          applies = false
          break

        case 'asked_financing':
          // Verificar se mencionou financiamento na mensagem
          applies = lead.message?.toLowerCase().includes('financiamento') || false
          break

        case 'has_urgency':
          // Verificar palavras de urgência
          const urgencyWords = ['urgente', 'rápido', 'logo', 'imediato', 'agora']
          applies = urgencyWords.some(word =>
            lead.message?.toLowerCase().includes(word)
          )
          break

        case 'perfect_match':
        case 'good_match':
          // TODO: Implementar matching com imóveis disponíveis
          applies = false
          break
      }

      if (applies) {
        appliedRules.push({
          rule: rule.name,
          points: rule.points,
          category: rule.category
        })

        // Adicionar pontos na categoria correta
        switch (rule.category) {
          case 'profile':
            profileScore += rule.points
            break
          case 'engagement':
            engagementScore += rule.points
            break
          case 'intent':
            intentScore += rule.points
            break
          case 'match':
            matchScore += rule.points
            break
        }
      }
    }

    // Calcular score total
    const totalScore = Math.min(100, profileScore + engagementScore + intentScore + matchScore)

    // Classificar lead
    let classification = 'cold'
    if (totalScore >= 80) classification = 'very_hot'
    else if (totalScore >= 60) classification = 'hot'
    else if (totalScore >= 40) classification = 'warm'

    // Buscar score existente
    const existingScore = await prisma.leadScore.findUnique({
      where: { leadId }
    })

    // Criar/atualizar histórico
    const scoreHistory = existingScore?.scoreHistory
      ? JSON.parse(existingScore.scoreHistory)
      : []

    scoreHistory.push({
      date: new Date().toISOString(),
      totalScore,
      profileScore,
      engagementScore,
      intentScore,
      matchScore,
      classification,
      appliedRules
    })

    // Limitar histórico a 50 entradas
    if (scoreHistory.length > 50) {
      scoreHistory.shift()
    }

    // Salvar score
    const leadScore = await prisma.leadScore.upsert({
      where: { leadId },
      create: {
        leadId,
        totalScore,
        profileScore,
        engagementScore,
        intentScore,
        matchScore,
        classification,
        lastCalculatedAt: new Date(),
        scoreHistory: JSON.stringify(scoreHistory)
      },
      update: {
        totalScore,
        profileScore,
        engagementScore,
        intentScore,
        matchScore,
        classification,
        lastCalculatedAt: new Date(),
        scoreHistory: JSON.stringify(scoreHistory)
      }
    })

    return NextResponse.json({
      leadScore,
      appliedRules,
      breakdown: {
        profile: profileScore,
        engagement: engagementScore,
        intent: intentScore,
        match: matchScore
      }
    })
  } catch (error) {
    console.error('Erro ao calcular lead score:', error)
    return NextResponse.json(
      { error: 'Erro ao calcular lead score' },
      { status: 500 }
    )
  }
}

// GET - Calcular scores de todos os leads
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const leads = await prisma.lead.findMany()

    const results = []

    for (const lead of leads) {
      try {
        // Chamar função de cálculo para cada lead
        const response = await fetch(`${process.env.NEXTAUTH_URL}/api/admin/lead-scoring/calculate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leadId: lead.id })
        })

        if (response.ok) {
          const data = await response.json()
          results.push({
            leadId: lead.id,
            name: lead.name,
            score: data.leadScore.totalScore,
            classification: data.leadScore.classification
          })
        }
      } catch (error) {
        console.error(`Erro ao calcular score do lead ${lead.id}:`, error)
      }
    }

    return NextResponse.json({
      total: leads.length,
      calculated: results.length,
      results
    })
  } catch (error) {
    console.error('Erro ao calcular scores:', error)
    return NextResponse.json(
      { error: 'Erro ao calcular scores' },
      { status: 500 }
    )
  }
}
