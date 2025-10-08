import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Verificar alertas ativos
    const alerts = await prisma.priceAlert.findMany({
      where: { active: true },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            price: true,
            previousPrice: true,
            priceReduced: true,
            priceReducedAt: true
          }
        }
      }
    })

    // Verificar variáveis de ambiente
    const envCheck = {
      hasTwilioSid: !!process.env.TWILIO_ACCOUNT_SID,
      hasTwilioToken: !!process.env.TWILIO_AUTH_TOKEN,
      hasTwilioNumber: !!process.env.TWILIO_WHATSAPP_NUMBER,
      hasAdminPhone: !!process.env.WHATSAPP_ADMIN_PHONE,
      twilioNumberValue: process.env.TWILIO_WHATSAPP_NUMBER,
      adminPhoneValue: process.env.WHATSAPP_ADMIN_PHONE
    }

    return NextResponse.json({
      totalAlerts: alerts.length,
      alerts: alerts.map(a => ({
        name: a.name,
        phone: a.phone,
        propertyId: a.propertyId,
        propertyTitle: a.property.title,
        currentPrice: a.property.price,
        previousPrice: a.property.previousPrice,
        priceReduced: a.property.priceReduced,
        priceReducedAt: a.property.priceReducedAt
      })),
      environment: envCheck
    })
  } catch (error) {
    console.error('Erro:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
