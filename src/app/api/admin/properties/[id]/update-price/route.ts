import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { newPrice } = await request.json()

    if (!newPrice || newPrice <= 0) {
      return NextResponse.json(
        { error: 'Preço deve ser maior que zero' },
        { status: 400 }
      )
    }

    // Buscar o imóvel atual
    const currentProperty = await prisma.property.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        price: true,
        previousPrice: true,
        priceReduced: true
      }
    })

    if (!currentProperty) {
      return NextResponse.json(
        { error: 'Imóvel não encontrado' },
        { status: 404 }
      )
    }

    const currentPrice = currentProperty.price
    const isPriceReduction = newPrice < currentPrice

    // Atualizar o preço
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        previousPrice: isPriceReduction ? currentPrice : currentProperty.previousPrice,
        price: newPrice,
        priceReduced: isPriceReduction,
        priceReducedAt: isPriceReduction ? new Date() : currentProperty.priceReducedAt
      }
    })

    // Se houve redução de preço, buscar interessados e enviar notificações
    if (isPriceReduction) {
      const priceAlerts = await prisma.priceAlert.findMany({
        where: {
          propertyId: id,
          active: true
        },
        select: {
          id: true,
          name: true,
          phone: true
        }
      })

      // Enviar notificações WhatsApp para cada interessado
      const notificationPromises = priceAlerts.map(async (alert) => {
        try {
          // Formatar mensagem
          const oldPriceFormatted = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(currentPrice)

          const newPriceFormatted = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(newPrice)

          const savings = currentPrice - newPrice
          const savingsFormatted = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(savings)

          const message = `🏡 *PREÇO REDUZIDO!*

Olá ${alert.name}!

O imóvel que você tem interesse teve uma redução de preço:

📍 *${currentProperty.title}*

💸 Preço anterior: ~${oldPriceFormatted}~
✅ *Novo preço: ${newPriceFormatted}*
💰 *Economia: ${savingsFormatted}*

Não perca essa oportunidade! Entre em contato conosco para mais informações.

Ver detalhes: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://faimoveis.com.br'}/imovel/${updatedProperty.slug}`

          // Aqui você pode integrar com sua API de WhatsApp (UltraMsg, Baileys, etc.)
          // Por enquanto, vamos apenas registrar no console
          console.log(`📱 WhatsApp para ${alert.phone}:`, message)

          // Exemplo de envio com UltraMsg (descomente e configure se necessário):
          /*
          const whatsappResponse = await fetch('https://api.ultramsg.com/instance_id/messages/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              token: process.env.ULTRAMSG_TOKEN,
              to: alert.phone,
              body: message
            })
          })
          */

          return { success: true, phone: alert.phone }
        } catch (error) {
          console.error(`Erro ao enviar WhatsApp para ${alert.phone}:`, error)
          return { success: false, phone: alert.phone, error }
        }
      })

      const notificationResults = await Promise.all(notificationPromises)
      const successCount = notificationResults.filter(r => r.success).length

      return NextResponse.json({
        success: true,
        message: 'Preço atualizado com sucesso',
        property: updatedProperty,
        priceReduction: {
          oldPrice: currentPrice,
          newPrice,
          savings: currentPrice - newPrice,
          notificationsSent: successCount,
          totalAlerts: priceAlerts.length
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Preço atualizado com sucesso',
      property: updatedProperty
    })

  } catch (error) {
    console.error('Erro ao atualizar preço:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}