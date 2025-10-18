import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do CRM avançado...')

  // ============================================
  // 1. CRIAR STAGES PADRÃO DO FUNIL KANBAN
  // ============================================
  console.log('\n📊 Criando stages do funil...')

  const stages = [
    {
      name: 'Captado',
      description: 'Lead recém-captado, ainda não foi contatado',
      color: '#94A3B8', // Slate
      icon: '📥',
      order: 1,
      type: 'active',
    },
    {
      name: 'Em Atendimento',
      description: 'Lead está sendo contatado pelo corretor',
      color: '#3B82F6', // Blue
      icon: '💬',
      order: 2,
      type: 'active',
    },
    {
      name: 'Visita Marcada',
      description: 'Visita ao imóvel foi agendada',
      color: '#8B5CF6', // Purple
      icon: '📅',
      order: 3,
      type: 'active',
    },
    {
      name: 'Proposta Enviada',
      description: 'Proposta foi enviada ao cliente',
      color: '#F59E0B', // Amber
      icon: '📄',
      order: 4,
      type: 'active',
    },
    {
      name: 'Em Negociação',
      description: 'Negociando valores e condições',
      color: '#EC4899', // Pink
      icon: '🤝',
      order: 5,
      type: 'active',
    },
    {
      name: 'Fechado - Ganho',
      description: 'Negócio fechado com sucesso! 🎉',
      color: '#10B981', // Green
      icon: '✅',
      order: 6,
      type: 'won',
    },
    {
      name: 'Perdido',
      description: 'Lead perdido ou desistiu',
      color: '#EF4444', // Red
      icon: '❌',
      order: 7,
      type: 'lost',
    },
  ]

  for (const stage of stages) {
    const existing = await prisma.leadStage.findFirst({
      where: { name: stage.name }
    })

    if (!existing) {
      await prisma.leadStage.create({ data: stage })
      console.log(`  ✅ Stage "${stage.name}" criado`)
    } else {
      console.log(`  ⏭️  Stage "${stage.name}" já existe`)
    }
  }

  // ============================================
  // 2. CRIAR REGRAS DE LEAD SCORING
  // ============================================
  console.log('\n🎯 Criando regras de Lead Scoring...')

  const scoringRules = [
    // ===== PERFIL DO LEAD (40 pontos max) =====
    {
      name: 'Tem telefone',
      description: 'Lead forneceu número de telefone',
      condition: 'has_phone',
      operator: 'exists',
      value: null,
      points: 10,
      category: 'profile',
      priority: 1,
    },
    {
      name: 'Tem email',
      description: 'Lead forneceu email',
      condition: 'has_email',
      operator: 'exists',
      value: null,
      points: 5,
      category: 'profile',
      priority: 2,
    },
    {
      name: 'Perfil completo',
      description: 'Lead tem nome, telefone E email',
      condition: 'profile_complete',
      operator: 'equals',
      value: 'true',
      points: 15,
      category: 'profile',
      priority: 3,
    },
    {
      name: 'Preferências definidas',
      description: 'Lead definiu faixa de preço e tipo de imóvel',
      condition: 'has_preferences',
      operator: 'exists',
      value: null,
      points: 10,
      category: 'profile',
      priority: 4,
    },

    // ===== ENGAJAMENTO (30 pontos max) =====
    {
      name: 'Conversou no chatbot',
      description: 'Lead interagiu com o chatbot',
      condition: 'chatbot_interaction',
      operator: 'greater_than',
      value: '0',
      points: 10,
      category: 'engagement',
      priority: 5,
    },
    {
      name: 'Múltiplas conversas',
      description: 'Lead conversou mais de 3 vezes',
      condition: 'chatbot_interaction',
      operator: 'greater_than',
      value: '3',
      points: 10,
      category: 'engagement',
      priority: 6,
    },
    {
      name: 'Respondeu rapidamente',
      description: 'Lead responde em menos de 5 minutos',
      condition: 'response_time',
      operator: 'less_than',
      value: '300', // 300 segundos = 5 min
      points: 5,
      category: 'engagement',
      priority: 7,
    },
    {
      name: 'Clicou em imóvel',
      description: 'Lead visualizou página de imóvel',
      condition: 'viewed_property',
      operator: 'equals',
      value: 'true',
      points: 5,
      category: 'engagement',
      priority: 8,
    },

    // ===== INTENÇÃO DE COMPRA (30 pontos max) =====
    {
      name: 'Pediu visita',
      description: 'Lead solicitou agendamento de visita',
      condition: 'requested_visit',
      operator: 'equals',
      value: 'true',
      points: 15,
      category: 'intent',
      priority: 9,
    },
    {
      name: 'Perguntou sobre financiamento',
      description: 'Lead perguntou sobre opções de financiamento',
      condition: 'asked_financing',
      operator: 'equals',
      value: 'true',
      points: 10,
      category: 'intent',
      priority: 10,
    },
    {
      name: 'Urgência mencionada',
      description: 'Lead mencionou urgência (palavras: urgente, rápido, logo)',
      condition: 'has_urgency',
      operator: 'equals',
      value: 'true',
      points: 10,
      category: 'intent',
      priority: 11,
    },
    {
      name: 'Interesse em múltiplos imóveis',
      description: 'Lead demonstrou interesse em mais de um imóvel',
      condition: 'interested_properties',
      operator: 'greater_than',
      value: '1',
      points: 5,
      category: 'intent',
      priority: 12,
    },

    // ===== MATCH COM IMÓVEIS (Bônus - pode ultrapassar 100) =====
    {
      name: 'Imóvel perfeito disponível',
      description: 'Temos imóvel que atende 100% das preferências',
      condition: 'perfect_match',
      operator: 'equals',
      value: 'true',
      points: 20,
      category: 'match',
      priority: 13,
    },
    {
      name: 'Bom match disponível',
      description: 'Temos imóvel que atende 80%+ das preferências',
      condition: 'good_match',
      operator: 'equals',
      value: 'true',
      points: 10,
      category: 'match',
      priority: 14,
    },
  ]

  for (const rule of scoringRules) {
    const existing = await prisma.leadScoreRule.findFirst({
      where: { name: rule.name }
    })

    if (!existing) {
      await prisma.leadScoreRule.create({ data: rule })
      console.log(`  ✅ Regra "${rule.name}" criada (+${rule.points} pts)`)
    } else {
      console.log(`  ⏭️  Regra "${rule.name}" já existe`)
    }
  }

  // ============================================
  // 3. CRIAR BOT PADRÃO (Template Assistido)
  // ============================================
  console.log('\n🤖 Criando bot padrão...')

  const defaultBot = await prisma.bot.findFirst({
    where: { name: 'Bot de Captação - WhatsApp' }
  })

  if (!defaultBot) {
    const bot = await prisma.bot.create({
      data: {
        name: 'Bot de Captação - WhatsApp',
        description: 'Bot automático para captar leads via WhatsApp',
        type: 'assistido',
        template: 'captacao_imoveis',
        active: true,
        channels: JSON.stringify(['whatsapp']),
        aiProvider: 'anthropic',
        aiModel: 'claude-sonnet-4-5',
        systemPrompt: `Você é um assistente virtual especializado em imóveis.
Seu objetivo é ajudar clientes a encontrar o imóvel ideal e captar suas informações.

SEMPRE:
- Seja educado e prestativo
- Faça perguntas para entender as necessidades
- Capture: nome, telefone, faixa de preço, tipo de imóvel desejado
- Sugira imóveis do banco de dados quando possível

NUNCA:
- Invente imóveis que não existem
- Seja agressivo ou insistente
- Forneça informações falsas`,
        autoCreateLead: true,
        autoAssignBroker: false,
      }
    })
    console.log(`  ✅ Bot "${bot.name}" criado`)
  } else {
    console.log(`  ⏭️  Bot padrão já existe`)
  }

  console.log('\n✅ Seed concluído com sucesso!')
  console.log('\n📊 Resumo:')
  console.log(`  - ${stages.length} stages criados`)
  console.log(`  - ${scoringRules.length} regras de scoring criadas`)
  console.log(`  - 1 bot padrão criado`)
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
