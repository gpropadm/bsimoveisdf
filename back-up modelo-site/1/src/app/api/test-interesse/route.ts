import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 [TESTE INTERESSE] Iniciando teste completo...')

    // 1. Testar configurações
    const instanceId = process.env.ULTRAMSG_INSTANCE_ID
    const token = process.env.ULTRAMSG_TOKEN
    const adminPhone = process.env.ULTRAMSG_ADMIN_PHONE

    if (!instanceId || !token) {
      return NextResponse.json({
        success: false,
        error: 'Configuração UltraMsg incompleta',
        details: {
          instanceId: !!instanceId,
          token: !!token,
          adminPhone: !!adminPhone
        }
      }, { status: 500 })
    }

    // 2. Chamar API de contato (simulando interesse real)
    const contactData = {
      name: `Teste Interesse ${new Date().toLocaleTimeString()}`,
      email: 'teste@modelo-site-imob.com',
      phone: '61999887766',
      subject: 'Interesse em Casa - Teste Sistema',
      message: `Teste automático do sistema de interesse em imóvel.

Enviado em: ${new Date().toLocaleString('pt-BR')}
Ambiente: ${process.env.NODE_ENV || 'development'}
Instância: ${instanceId}

Este é um teste para verificar se o sistema está funcionando corretamente.`
    }

    console.log('📞 [TESTE] Enviando para API de contato...')

    const contactResponse = await fetch(`${request.nextUrl.origin}/api/contact-messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactData)
    })

    const contactResult = await contactResponse.json()

    console.log('📋 [TESTE] Resultado contato:', contactResult)

    // 3. Testar API UltraMsg diretamente
    console.log('📱 [TESTE] Testando UltraMsg diretamente...')

    const ultraMsgUrl = `https://api.ultramsg.com/${instanceId}/messages/chat`
    const testMessage = `🧪 *TESTE DIRETO ULTRAMSG*

⚡ Sistema: ${process.env.NODE_ENV || 'development'}
🕐 Horário: ${new Date().toLocaleString('pt-BR')}
🔧 Instância: ${instanceId}
📱 Para: ${adminPhone}

✅ Se você recebeu esta mensagem, o UltraMsg está funcionando!

#TesteSistema #Debug`

    const directPayload = {
      token: token,
      to: adminPhone?.replace(/\D/g, ''),
      body: testMessage,
      priority: 'high'
    }

    const directResponse = await fetch(ultraMsgUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(directPayload)
    })

    const directResult = await directResponse.json()

    console.log('🔧 [TESTE] Resultado UltraMsg direto:', directResult)

    // 4. Verificar status da instância
    const statusUrl = `https://api.ultramsg.com/${instanceId}/instance/status?token=${token}`
    const statusResponse = await fetch(statusUrl)
    const statusResult = await statusResponse.json()

    console.log('📊 [TESTE] Status da instância:', statusResult)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      tests: {
        config: {
          success: true,
          instanceId: instanceId.substring(0, 8) + '...',
          hasToken: !!token,
          adminPhone: adminPhone
        },
        contactApi: {
          success: contactResponse.ok,
          status: contactResponse.status,
          result: contactResult
        },
        ultraMsgDirect: {
          success: directResponse.ok,
          status: directResponse.status,
          result: directResult
        },
        instanceStatus: {
          success: statusResponse.ok,
          status: statusResponse.status,
          result: statusResult
        }
      }
    })

  } catch (error) {
    console.error('💥 [TESTE INTERESSE] Erro:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro no teste',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Endpoint de teste de interesse',
    usage: 'POST para executar teste completo',
    timestamp: new Date().toISOString()
  })
}