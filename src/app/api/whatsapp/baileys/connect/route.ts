import { NextResponse } from 'next/server'
import { getWhatsAppInstance } from '@/lib/whatsapp-webjs'

// Variável global para manter instância ativa
let isInitialized = false

export async function POST() {
  try {
    if (isInitialized) {
      return NextResponse.json({
        message: 'WhatsApp já está conectado',
        connected: true
      })
    }

    const whatsapp = getWhatsAppInstance()

    // Inicializar em background
    whatsapp.initialize().catch(err => {
      console.error('Erro ao inicializar WhatsApp:', err)
    })

    isInitialized = true

    return NextResponse.json({
      message: 'WhatsApp inicializando... Escaneie o QR code no terminal do servidor',
      connected: false
    })

  } catch (error) {
    console.error('Erro ao conectar WhatsApp:', error)
    return NextResponse.json(
      { error: 'Erro ao conectar WhatsApp' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const whatsapp = getWhatsAppInstance()
    const connected = whatsapp.isConnected()

    return NextResponse.json({
      connected,
      message: connected ? 'WhatsApp conectado' : 'WhatsApp desconectado'
    })

  } catch (error) {
    return NextResponse.json({ connected: false })
  }
}
