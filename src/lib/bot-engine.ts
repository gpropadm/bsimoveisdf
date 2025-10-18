// Motor do Bot - Processa mensagens e executa ações
import { PrismaClient } from '@prisma/client'
import Anthropic from '@anthropic-ai/sdk'

const prisma = new PrismaClient()

export interface BotMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface BotContext {
  userName?: string
  userEmail?: string
  userPhone?: string
  preferences?: {
    type?: string
    category?: string
    city?: string
    bedrooms?: number
    maxPrice?: number
    minPrice?: number
  }
  interestedPropertyId?: string
  intent?: 'high' | 'medium' | 'low'
}

export interface BotSession {
  id: string
  botId: string
  channelId: string
  messages: BotMessage[]
  context: BotContext
  leadId?: string
}

export interface BotResponse {
  message: string
  actions: Array<{
    type: 'create_lead' | 'calculate_score' | 'create_task' | 'send_properties'
    data?: any
  }>
  context: BotContext
}

export class BotEngine {
  private anthropic: Anthropic

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({ apiKey })
  }

  async processMessage(
    session: BotSession,
    userMessage: string
  ): Promise<BotResponse> {
    // 1. Buscar imóveis disponíveis
    const properties = await prisma.property.findMany({
      where: { status: 'disponivel' },
      select: {
        id: true,
        title: true,
        slug: true,
        type: true,
        category: true,
        price: true,
        bedrooms: true,
        bathrooms: true,
        area: true,
        city: true,
        state: true,
        address: true,
        description: true,
      },
      take: 50
    })

    // 2. Buscar bot config
    const bot = await prisma.bot.findUnique({
      where: { id: session.botId }
    })

    if (!bot) {
      throw new Error('Bot não encontrado')
    }

    // 3. Criar contexto para IA
    const propertyContext = properties.map((p, i) => {
      return `${i + 1}. ${p.title}
   - Tipo: ${p.type === 'venda' ? 'Venda' : 'Aluguel'}
   - Categoria: ${p.category}
   - Preço: R$ ${p.price.toLocaleString('pt-BR')}
   - Quartos: ${p.bedrooms || 'N/A'}
   - Banheiros: ${p.bathrooms || 'N/A'}
   - Área: ${p.area || 'N/A'} m²
   - Localização: ${p.city} - ${p.state}
   - Link: https://seu-site.com/imovel/${p.slug}`
    }).join('\n\n')

    const conversationHistory = session.messages
      .map(m => `${m.role === 'user' ? 'CLIENTE' : 'BOT'}: ${m.content}`)
      .join('\n')

    // 4. Prompt para IA
    const systemPrompt = bot.systemPrompt || `Você é um assistente virtual de vendas imobiliárias.

SEU OBJETIVO:
- Ajudar o cliente a encontrar o imóvel ideal
- Capturar informações: nome, telefone, email, preferências
- Qualificar o lead (intenção de compra)

REGRAS:
1. NUNCA invente imóveis que não estão na lista
2. SEMPRE sugira até 3 imóveis que correspondam às preferências
3. Se não houver imóveis adequados, seja honesto e pergunte se quer ver opções similares
4. Quando cliente demonstrar interesse forte, peça nome e email
5. Seja amigável mas profissional`

    const userPrompt = `
HISTÓRICO DA CONVERSA:
${conversationHistory}

CONTEXTO ATUAL:
${JSON.stringify(session.context, null, 2)}

IMÓVEIS DISPONÍVEIS:
${propertyContext}

NOVA MENSAGEM DO CLIENTE:
"${userMessage}"

INSTRUÇÕES:
Analise a mensagem e responda ao cliente de forma natural.

Retorne APENAS um JSON válido neste formato exato:
{
  "message": "sua resposta completa ao cliente aqui",
  "context": {
    "userName": "nome se fornecido",
    "userEmail": "email se fornecido",
    "userPhone": "telefone se fornecido",
    "preferences": {
      "type": "venda ou aluguel se mencionado",
      "category": "apartamento/casa/etc se mencionado",
      "city": "cidade se mencionada",
      "bedrooms": numero_quartos_se_mencionado,
      "maxPrice": preco_maximo_se_mencionado,
      "minPrice": preco_minimo_se_mencionado
    },
    "interestedPropertyId": "id do imóvel se cliente demonstrou interesse específico",
    "intent": "high se cliente quer visitar/comprar, medium se está pesquisando, low se só perguntando"
  },
  "actions": [
    {"type": "send_properties", "data": {"propertyIds": ["id1", "id2"]}}
  ],
  "shouldCreateLead": true ou false (true se tem nome E (telefone OU email))
}

IMPORTANTE: Retorne APENAS o JSON, sem texto adicional antes ou depois.`

    // 5. Chamar IA
    const response = await this.anthropic.messages.create({
      model: bot.aiModel || 'claude-sonnet-4-5-20250929',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        ...session.messages.map(m => ({
          role: m.role === 'user' ? 'user' as const : 'assistant' as const,
          content: m.content
        })),
        { role: 'user', content: userPrompt }
      ]
    })

    // 6. Parsear resposta
    const aiText = response.content[0].type === 'text'
      ? response.content[0].text
      : '{}'

    let aiResponse
    try {
      // Tentar extrair JSON da resposta
      const jsonMatch = aiText.match(/\{[\s\S]*\}/)
      aiResponse = JSON.parse(jsonMatch ? jsonMatch[0] : aiText)
    } catch (error) {
      console.error('Erro ao parsear resposta da IA:', aiText)
      aiResponse = {
        message: aiText,
        context: session.context,
        actions: [],
        shouldCreateLead: false
      }
    }

    // 7. Preparar ações automáticas
    const actions: BotResponse['actions'] = []

    if (aiResponse.shouldCreateLead && !session.leadId) {
      actions.push({
        type: 'create_lead',
        data: {
          name: aiResponse.context.userName || session.context.userName,
          email: aiResponse.context.userEmail || session.context.userEmail,
          phone: aiResponse.context.userPhone || session.channelId,
          preferences: aiResponse.context.preferences
        }
      })
    }

    // Adicionar outras ações da IA
    if (aiResponse.actions) {
      actions.push(...aiResponse.actions)
    }

    return {
      message: aiResponse.message,
      actions,
      context: {
        ...session.context,
        ...aiResponse.context,
        preferences: {
          ...session.context.preferences,
          ...aiResponse.context.preferences
        }
      }
    }
  }

  async executeActions(
    actions: BotResponse['actions'],
    session: BotSession,
    context: BotContext
  ): Promise<string | null> {
    let leadId: string | null = session.leadId || null

    for (const action of actions) {
      switch (action.type) {
        case 'create_lead':
          if (!leadId) {
            const lead = await prisma.lead.create({
              data: {
                name: action.data.name || 'Cliente Bot',
                email: action.data.email || null,
                phone: action.data.phone || session.channelId,
                source: 'whatsapp_bot',
                currentStage: 'captado',
                message: `Lead capturado via Bot WhatsApp\n\nPreferências:\n${JSON.stringify(context.preferences, null, 2)}`,
                preferredType: context.preferences?.type,
                preferredCategory: context.preferences?.category,
                preferredCity: context.preferences?.city,
                preferredBedrooms: context.preferences?.bedrooms,
                preferredPriceMax: context.preferences?.maxPrice,
                preferredPriceMin: context.preferences?.minPrice,
              }
            })
            leadId = lead.id

            // Auto-calcular score
            try {
              await this.calculateLeadScore(leadId)
            } catch (error) {
              console.error('Erro ao calcular score:', error)
            }
          }
          break

        case 'create_task':
          if (leadId) {
            await prisma.task.create({
              data: {
                leadId,
                title: action.data?.title || 'Contatar lead do WhatsApp',
                description: action.data?.description,
                type: action.data?.type || 'follow_up',
                priority: action.data?.priority || 'medium',
                dueDate: action.data?.dueDate || new Date(Date.now() + 2 * 60 * 60 * 1000),
                automated: true
              }
            })
          }
          break
      }
    }

    return leadId
  }

  private async calculateLeadScore(leadId: string) {
    // Chama API de scoring (já criada)
    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead) return

    const rules = await prisma.leadScoreRule.findMany({
      where: { active: true },
      orderBy: { priority: 'asc' }
    })

    let totalScore = 0
    let profileScore = 0
    let engagementScore = 0
    let intentScore = 0

    for (const rule of rules) {
      let applies = false

      switch (rule.condition) {
        case 'has_phone':
          applies = !!lead.phone
          break
        case 'has_email':
          applies = !!lead.email
          break
        case 'profile_complete':
          applies = !!(lead.name && lead.phone && lead.email)
          break
        case 'has_preferences':
          applies = !!(lead.preferredPriceMin || lead.preferredPriceMax || lead.preferredCategory)
          break
      }

      if (applies) {
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
        }
        totalScore += rule.points
      }
    }

    totalScore = Math.min(100, totalScore)

    let classification = 'cold'
    if (totalScore >= 80) classification = 'very_hot'
    else if (totalScore >= 60) classification = 'hot'
    else if (totalScore >= 40) classification = 'warm'

    await prisma.leadScore.upsert({
      where: { leadId },
      create: {
        leadId,
        totalScore,
        profileScore,
        engagementScore,
        intentScore,
        matchScore: 0,
        classification,
        lastCalculatedAt: new Date()
      },
      update: {
        totalScore,
        profileScore,
        engagementScore,
        intentScore,
        classification,
        lastCalculatedAt: new Date()
      }
    })
  }
}
