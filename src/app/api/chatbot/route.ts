import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  // Buscar API Key do banco de dados (settings)
  const settings = await prisma.settings.findFirst()
  const apiKey = settings?.anthropicApiKey || process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Chave da API Anthropic não configurada. Configure em Admin > Configurações' },
      { status: 500 }
    )
  }

  const anthropic = new Anthropic({ apiKey })
  try {
    const { message, conversationHistory = [] } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Mensagem é obrigatória' },
        { status: 400 }
      )
    }

    // Buscar propriedades do banco para contexto
    const properties = await prisma.property.findMany({
      where: { status: 'disponivel' },
      select: {
        id: true,
        title: true,
        type: true,
        category: true,
        price: true,
        bedrooms: true,
        bathrooms: true,
        area: true,
        address: true,
        city: true,
        state: true,
        description: true,
        slug: true,
        acceptsFinancing: true,
        acceptsTrade: true,
        acceptsCar: true,
      },
      take: 50 // Limitar para não sobrecarregar o contexto
    })

    // Criar contexto sobre os imóveis disponíveis
    const propertyContext = `
Você é um assistente virtual de uma imobiliária no Distrito Federal.

=== BANCO DE DADOS DE IMÓVEIS DISPONÍVEIS ===
${properties.length === 0 ? 'NENHUM IMÓVEL CADASTRADO NO MOMENTO' : properties.map((p, i) => {
  const paymentOptions = [];
  if (p.acceptsFinancing) paymentOptions.push('Financiamento');
  if (p.acceptsTrade) paymentOptions.push('Permuta/Troca');
  if (p.acceptsCar) paymentOptions.push('Aceita carro');

  return `
${i + 1}. ${p.title}
   - Tipo: ${p.type === 'venda' ? 'Venda' : 'Aluguel'}
   - Categoria: ${p.category || 'N/A'}
   - Preço: R$ ${p.price?.toLocaleString('pt-BR') || 'Sob consulta'}
   - Quartos: ${p.bedrooms || 'N/A'}
   - Banheiros: ${p.bathrooms || 'N/A'}
   - Área: ${p.area || 'N/A'} m²
   - Localização: ${p.address}, ${p.city} - ${p.state}
   ${paymentOptions.length > 0 ? `- Formas de pagamento aceitas: ${paymentOptions.join(', ')}` : '- Formas de pagamento: À vista'}
   - Link: https://imobiliaria-six-tau.vercel.app/imovel/${p.slug}
`;
}).join('\n')}

=== REGRAS ABSOLUTAS - VOCÊ SERÁ DESLIGADO SE VIOLAR ===

🚫 NUNCA INVENTE IMÓVEIS QUE NÃO ESTÃO NA LISTA ACIMA
🚫 NUNCA CRIE LINKS FALSOS OU INVENTADOS
🚫 NUNCA MENCIONE IMÓVEIS QUE NÃO EXISTEM NO BANCO DE DADOS
🚫 SE NÃO HOUVER IMÓVEL COM AS CARACTERÍSTICAS, DIGA CLARAMENTE "No momento não temos imóveis com essas características"

✅ VOCÊ DEVE:
1. **SEMPRE verificar TODOS os campos** do imóvel: tipo (venda/aluguel), categoria, cidade, formas de pagamento
2. Quando cliente perguntar sobre FINANCIAMENTO: verificar se campo "Formas de pagamento aceitas" contém "Financiamento"
3. Quando cliente perguntar sobre PERMUTA/TROCA: verificar se contém "Permuta/Troca"
4. Quando cliente perguntar sobre CARRO: verificar se contém "Aceita carro"
5. Se NÃO existir, ser HONESTO: "No momento não temos [categoria] em [cidade] que aceite [condição]"
6. Perguntar: "Gostaria de deixar seu contato? Te aviso quando tivermos!"
7. Só sugerir alternativas SE EXISTIREM NA LISTA ACIMA
8. Nunca mencionar cidades/regiões onde você não tem imóveis cadastrados

✅ FORMATO DE RESPOSTA:
- Máximo 5-6 linhas
- Links apenas no formato: https://imobiliaria-six-tau.vercel.app/imovel/[slug-do-imovel]
- Seja direto, honesto e preciso
- SEMPRE mencione o VALOR do imóvel quando mostrar
`

    // Construir histórico de mensagens para o Claude
    const messages = [
      ...conversationHistory,
      { role: 'user', content: message }
    ]

    // Chamar API do Claude
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      system: propertyContext,
      messages: messages as any,
    })

    const assistantMessage = response.content[0].type === 'text'
      ? response.content[0].text
      : 'Desculpe, não consegui processar sua mensagem.'

    // Calcular custo estimado (Claude Sonnet 4.5)
    // Input: $3 por 1M tokens | Output: $15 por 1M tokens
    const inputTokens = response.usage?.input_tokens || 0
    const outputTokens = response.usage?.output_tokens || 0
    const costInput = (inputTokens / 1000000) * 3
    const costOutput = (outputTokens / 1000000) * 15
    const totalCost = costInput + costOutput

    // Detectar se o cliente forneceu contato (nome + telefone)
    const phoneRegex = /\b\d{8,11}\b/g
    const phones = message.match(phoneRegex)

    if (phones && phones.length > 0 && conversationHistory.length > 2) {
      // Buscar nome no histórico da conversa (geralmente vem antes do telefone)
      let name = 'Cliente Chatbot'

      // Tentar extrair nome de mensagens anteriores do usuário
      const userMessages = conversationHistory.filter((msg: any) => msg.role === 'user')

      // Procurar por padrões de nome nas mensagens anteriores
      for (let i = userMessages.length - 1; i >= 0; i--) {
        const msg = userMessages[i].content

        // Padrão: "meu nome é X" ou "me chamo X" ou "sou X"
        const namePatterns = [
          /(?:meu nome é|me chamo|sou|nome:?)\s+([A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]+(?:\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]+)*)/i,
          // Padrão: apenas nome próprio (primeira letra maiúscula)
          /^([A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]+(?:\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]+)+)$/
        ]

        for (const pattern of namePatterns) {
          const match = msg.match(pattern)
          if (match && match[1]) {
            name = match[1].trim()
            break
          }
        }

        if (name !== 'Cliente Chatbot') break
      }

      // Se não encontrou nos padrões, tentar extrair da mensagem atual
      if (name === 'Cliente Chatbot') {
        const nameParts = message.split(/[,\s]+/).filter(p =>
          p.length > 2 &&
          !/^\d+$/.test(p) &&
          !/^(sim|ok|oi|olá|quero|é|meu|telefone|número|whatsapp|zap)$/i.test(p) &&
          /^[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(p) // Começa com maiúscula
        )
        if (nameParts.length > 0) {
          name = nameParts.slice(0, 2).join(' ')
        }
      }

      const phone = phones[0]

      try {
        // Formatar conversa como chat real
        const conversationText = conversationHistory
          .map((msg) => {
            if (msg.role === 'user') {
              return `┌─ 👤 CLIENTE ─────────────────────\n│ ${msg.content}\n└──────────────────────────────────`
            } else {
              return `┌─ 🤖 ASSISTENTE ──────────────────\n│ ${msg.content}\n└──────────────────────────────────`
            }
          })
          .join('\n\n')

        const fullMessage = `📱 LEAD CAPTURADO VIA CHATBOT

════════════════════════════════════════
HISTÓRICO DA CONVERSA
════════════════════════════════════════

${conversationText}

┌─ 👤 CLIENTE ─────────────────────
│ ${message}
└──────────────────────────────────

════════════════════════════════════════
📊 RESUMO DO LEAD
════════════════════════════════════════
✓ Cliente deixou contato após conversa
✓ Nome: ${name}
✓ Telefone: ${phone}
✓ Fonte: Chatbot IA
✓ Interessado em imóveis - Acompanhar!`

        // Salvar lead no banco
        await prisma.lead.create({
          data: {
            name: name,
            phone: phone,
            email: '',
            message: fullMessage,
            source: 'chatbot'
          }
        })
        console.log('✅ Lead salvo:', { name, phone })
      } catch (error) {
        console.error('Erro ao salvar lead:', error)
      }
    }

    // Salvar estatísticas do chatbot
    try {
      await prisma.chatbotStats.create({
        data: {
          messagesCount: 1,
          tokensInput: inputTokens,
          tokensOutput: outputTokens,
          costEstimated: totalCost,
          leadCaptured: phones && phones.length > 0 && conversationHistory.length > 2
        }
      })
    } catch (error) {
      console.error('Erro ao salvar estatísticas:', error)
    }

    return NextResponse.json({
      message: assistantMessage,
      conversationHistory: [
        ...conversationHistory,
        { role: 'user', content: message },
        { role: 'assistant', content: assistantMessage }
      ]
    })

  } catch (error: any) {
    console.error('Erro no chatbot:', error)
    return NextResponse.json(
      {
        error: 'Erro ao processar mensagem',
        details: error.message
      },
      { status: 500 }
    )
  }
}
