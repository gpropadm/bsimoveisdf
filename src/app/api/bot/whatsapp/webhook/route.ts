import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { BotEngine } from '@/lib/bot-engine'

const prisma = new PrismaClient()

// POST - Receber mensagens do WhatsApp
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📱 Mensagem WhatsApp recebida:', JSON.stringify(body, null, 2))

    // Extrair dados da mensagem (formato pode variar por provedor)
    // Twilio envia: From (whatsapp:+number), Body, MessageSid
    // Evolution/UltraMsg envia: from, text, id
    const from = body.from || body.From?.replace('whatsapp:', '') || body.phone || body.sender
    const messageText = body.text || body.Body || body.body || body.message
    const messageId = body.id || body.MessageSid || body.messageId || Date.now().toString()

    if (!from || !messageText) {
      return NextResponse.json(
        { error: 'Dados inválidos: faltando from ou text' },
        { status: 400 }
      )
    }

    console.log(`📥 De: ${from}`)
    console.log(`💬 Mensagem: ${messageText}`)

    // 1. Buscar ou criar sessão do bot
    let session = await prisma.botSession.findFirst({
      where: {
        channelId: from,
        channel: 'whatsapp',
        status: 'active'
      },
      orderBy: { lastMessageAt: 'desc' }
    })

    // Buscar bot ativo
    const bot = await prisma.bot.findFirst({
      where: {
        active: true,
        channels: { contains: 'whatsapp' }
      }
    })

    if (!bot) {
      console.error('❌ Nenhum bot ativo encontrado')
      return NextResponse.json(
        { error: 'Nenhum bot ativo configurado' },
        { status: 500 }
      )
    }

    // Criar nova sessão se não existir
    if (!session) {
      console.log('🆕 Criando nova sessão...')
      session = await prisma.botSession.create({
        data: {
          botId: bot.id,
          channel: 'whatsapp',
          channelId: from,
          status: 'active',
          messages: JSON.stringify([]),
          context: JSON.stringify({}),
          startedAt: new Date(),
          lastMessageAt: new Date()
        }
      })
    }

    // 2. Parsear histórico de mensagens
    const messages = session.messages ? JSON.parse(session.messages) : []
    const context = session.context ? JSON.parse(session.context) : {}

    // Adicionar mensagem do usuário
    messages.push({
      role: 'user',
      content: messageText,
      timestamp: new Date()
    })

    // 3. Processar com Bot Engine
    const settings = await prisma.settings.findFirst()
    const apiKey = settings?.anthropicApiKey || process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key da Anthropic não configurada' },
        { status: 500 }
      )
    }

    const botEngine = new BotEngine(apiKey)

    const response = await botEngine.processMessage(
      {
        id: session.id,
        botId: session.botId,
        channelId: from,
        messages,
        context,
        leadId: session.leadId || undefined
      },
      messageText
    )

    console.log('🤖 Resposta do bot:', response.message)
    console.log('⚡ Ações:', response.actions)

    // 4. Executar ações automáticas
    const leadId = await botEngine.executeActions(
      response.actions,
      {
        id: session.id,
        botId: session.botId,
        channelId: from,
        messages,
        context: response.context,
        leadId: session.leadId || undefined
      },
      response.context
    )

    // 5. Adicionar resposta do bot ao histórico
    messages.push({
      role: 'assistant',
      content: response.message,
      timestamp: new Date()
    })

    // 6. Atualizar sessão
    await prisma.botSession.update({
      where: { id: session.id },
      data: {
        messages: JSON.stringify(messages),
        context: JSON.stringify(response.context),
        lastMessageAt: new Date(),
        leadCreated: leadId ? true : session.leadCreated,
        leadId: leadId || session.leadId
      }
    })

    // 7. Atualizar estatísticas do bot
    await prisma.bot.update({
      where: { id: bot.id },
      data: {
        conversationsCount: { increment: 1 },
        leadsCreatedCount: leadId && !session.leadId ? { increment: 1 } : undefined
      }
    })

    console.log('✅ Processamento concluído')

    // 8. Retornar resposta para enviar ao WhatsApp
    return NextResponse.json({
      success: true,
      message: response.message,
      to: from,
      leadCreated: !!leadId,
      leadId: leadId || session.leadId
    })

  } catch (error: any) {
    console.error('❌ Erro ao processar mensagem:', error)
    return NextResponse.json(
      {
        error: 'Erro ao processar mensagem',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// GET - Webhook de verificação (para Meta WhatsApp e Twilio)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  // Meta WhatsApp verification
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('✅ Webhook verificado (Meta)!')
    return new NextResponse(challenge, { status: 200 })
  }

  // Twilio doesn't require verification, just respond with 200
  console.log('✅ Webhook OK (Twilio)')
  return NextResponse.json({ status: 'ok', message: 'Webhook ativo' }, { status: 200 })
}
