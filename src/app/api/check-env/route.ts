import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    WHATSAPP_ADMIN_PHONE: process.env.WHATSAPP_ADMIN_PHONE || 'NÃO CONFIGURADO',
    TWILIO_WHATSAPP_NUMBER: process.env.TWILIO_WHATSAPP_NUMBER || 'NÃO CONFIGURADO',
    message: 'Verifique se WHATSAPP_ADMIN_PHONE está configurado na Vercel'
  })
}
