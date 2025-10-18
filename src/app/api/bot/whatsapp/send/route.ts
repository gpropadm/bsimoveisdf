import { NextRequest, NextResponse } from 'next/server'

// POST - Enviar mensagem pelo WhatsApp
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, message } = body

    if (!to || !message) {
      return NextResponse.json(
        { error: 'to e message são obrigatórios' },
        { status: 400 }
      )
    }

    // Aqui você pode integrar com diferentes provedores:
    // 1. Evolution API (gratuito, self-hosted)
    // 2. WhatsApp Business API (Meta)
    // 3. Twilio
    // 4. UltraMsg
    // 5. Baileys (gratuito, via biblioteca)

    const provider = process.env.WHATSAPP_PROVIDER || 'evolution'

    switch (provider) {
      case 'evolution':
        return await sendViaEvolution(to, message)

      case 'twilio':
        return await sendViaTwilio(to, message)

      case 'ultramsg':
        return await sendViaUltraMsg(to, message)

      default:
        // Modo de simulação (para testes)
        console.log(`📤 [SIMULAÇÃO] Enviando para ${to}:`, message)
        return NextResponse.json({
          success: true,
          message: 'Mensagem enviada (modo simulação)',
          to,
          provider: 'simulation'
        })
    }

  } catch (error: any) {
    console.error('Erro ao enviar mensagem:', error)
    return NextResponse.json(
      { error: 'Erro ao enviar mensagem', details: error.message },
      { status: 500 }
    )
  }
}

// Evolution API (Recomendado - Gratuito e Self-hosted)
async function sendViaEvolution(to: string, message: string) {
  const evolutionUrl = process.env.EVOLUTION_API_URL
  const evolutionKey = process.env.EVOLUTION_API_KEY
  const instanceName = process.env.EVOLUTION_INSTANCE_NAME

  if (!evolutionUrl || !evolutionKey || !instanceName) {
    console.warn('⚠️ Evolution API não configurada, usando modo simulação')
    return NextResponse.json({
      success: true,
      message: 'Evolution API não configurada (modo simulação)',
      to
    })
  }

  const response = await fetch(`${evolutionUrl}/message/sendText/${instanceName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': evolutionKey
    },
    body: JSON.stringify({
      number: to.replace(/\D/g, ''),
      text: message
    })
  })

  const data = await response.json()

  return NextResponse.json({
    success: response.ok,
    message: 'Mensagem enviada via Evolution API',
    to,
    provider: 'evolution',
    response: data
  })
}

// Twilio (Pago)
async function sendViaTwilio(to: string, message: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error('Twilio não configurado')
  }

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        From: `whatsapp:${fromNumber}`,
        To: `whatsapp:${to}`,
        Body: message
      })
    }
  )

  const data = await response.json()

  return NextResponse.json({
    success: response.ok,
    message: 'Mensagem enviada via Twilio',
    to,
    provider: 'twilio',
    response: data
  })
}

// UltraMsg (Pago mas barato)
async function sendViaUltraMsg(to: string, message: string) {
  const instanceId = process.env.ULTRAMSG_INSTANCE_ID
  const token = process.env.ULTRAMSG_TOKEN

  if (!instanceId || !token) {
    throw new Error('UltraMsg não configurado')
  }

  const response = await fetch(
    `https://api.ultramsg.com/${instanceId}/messages/chat`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        token: token,
        to: to.replace(/\D/g, ''),
        body: message
      })
    }
  )

  const data = await response.json()

  return NextResponse.json({
    success: response.ok,
    message: 'Mensagem enviada via UltraMsg',
    to,
    provider: 'ultramsg',
    response: data
  })
}
