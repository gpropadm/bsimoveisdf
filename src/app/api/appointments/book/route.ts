import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWhatsAppMessage } from '@/lib/whatsapp-twilio';

export async function POST(request: NextRequest) {
  try {
    const {
      date,
      time,
      clientName,
      clientPhone,
      clientEmail,
      propertyTitle,
      propertyAddress,
      propertyId
    } = await request.json();

    if (!date || !time || !clientName || !clientPhone || !propertyTitle) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar conflitos no banco de dados antes de salvar
    const appointmentDate = new Date(`${date}T${time}:00`);
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        scheduledDate: appointmentDate,
        status: {
          not: 'cancelado'
        }
      }
    });

    if (existingAppointments.length > 0) {
      return NextResponse.json({
        success: false,
        message: '⚠️ Esse horário já foi reservado por outro cliente! Que tal escolher um desses horários disponíveis?',
        alternatives: [
          { data: date, hora: '09:00', corretor: 'João Silva', status: 'disponível' },
          { data: date, hora: '14:00', corretor: 'Ana Costa', status: 'disponível' },
          { data: date, hora: '16:00', corretor: 'João Silva', status: 'disponível' }
        ],
        error_code: 'TIME_CONFLICT'
      });
    }

    // Criar agendamento no banco de dados
    const appointment = await prisma.appointment.create({
      data: {
        propertyId: propertyId,
        clientName,
        clientEmail: clientEmail || '',
        clientPhone,
        scheduledDate: appointmentDate,
        status: 'agendado',
        duration: 60
      }
    });

    // Formatar data e hora para exibição
    const formattedDate = new Date(`${date}T${time}:00`).toLocaleDateString('pt-BR');
    const formattedDateTime = new Date(`${date}T${time}:00`).toLocaleString('pt-BR');

    // Enviar notificação via WhatsApp usando Twilio
    try {
      const phoneAdmin = process.env.WHATSAPP_ADMIN_PHONE || '5561996900444';

      // Buscar imagem do imóvel
      let propertyImage = null;
      if (propertyId) {
        try {
          const property = await prisma.property.findUnique({
            where: { id: propertyId },
            select: { images: true }
          });

          if (property && property.images) {
            const images = JSON.parse(property.images);
            if (Array.isArray(images) && images.length > 0) {
              propertyImage = images[0]; // Primeira imagem
              console.log('📷 Imagem do imóvel encontrada:', propertyImage);
            }
          }
        } catch (error) {
          console.log('⚠️ Erro ao buscar imagem:', error);
        }
      }

      const whatsappMessage = `🏠 *NOVA VISITA AGENDADA*

📋 Imóvel: ${propertyTitle}
📍 Endereço: ${propertyAddress || 'Não informado'}

👤 Cliente: ${clientName}
📞 Telefone: ${clientPhone}
📧 Email: ${clientEmail || 'Não informado'}

📅 Data/Hora: ${formattedDateTime}
⏱️ Duração: 60 minutos

🆔 Agendamento ID: ${appointment.id}`;

      // Enviar via Twilio (com imagem se tiver)
      const sent = await sendWhatsAppMessage(phoneAdmin, whatsappMessage, propertyImage || undefined);

      if (sent) {
        console.log('✅ WhatsApp de agendamento enviado via Twilio');

        // Salvar mensagem no banco
        await prisma.whatsAppMessage.create({
          data: {
            messageId: `appointment-${Date.now()}`,
            from: 'twilio',
            to: phoneAdmin,
            body: whatsappMessage,
            type: 'text',
            timestamp: new Date(),
            fromMe: true,
            status: 'sent',
            source: 'twilio_api',
            propertyId: propertyId,
            contactName: clientName
          }
        });
      } else {
        console.log('❌ Falha ao enviar WhatsApp de agendamento via Twilio');
      }
    } catch (whatsappError) {
      console.error('❌ Erro ao enviar notificação WhatsApp:', whatsappError);
      // Não falhar a requisição se o WhatsApp falhar
    }

    return NextResponse.json({
      success: true,
      message: 'Agendamento realizado com sucesso',
      corretor: 'João Silva',
      appointmentId: appointment.id,
      details: {
        data: formattedDate,
        hora: time,
        cliente: clientName,
        telefone: clientPhone,
        imovel: propertyTitle
      }
    });

  } catch (error) {
    console.error('Erro ao agendar visita:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}