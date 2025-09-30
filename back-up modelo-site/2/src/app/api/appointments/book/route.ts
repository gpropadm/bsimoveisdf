import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    // Mensagem para WhatsApp
    const message = `*🏠 AGENDAMENTO DE VISITA*

*Imóvel:* ${propertyTitle}
*Endereço:* ${propertyAddress || 'Não informado'}

*📅 Data e Hora:* ${formattedDateTime}

*👤 Dados do Cliente:*
*Nome:* ${clientName}
*Telefone:* ${clientPhone}
${clientEmail ? `*Email:* ${clientEmail}` : ''}

*🔗 ID do Agendamento:* ${appointment.id}

*📅 Data do agendamento:* ${new Date().toLocaleString('pt-BR')}`;

    // Buscar configurações para pegar o WhatsApp diretamente do Prisma
    let whatsappNumber = '5548998645864'; // fallback

    try {
      const settings = await prisma.settings.findFirst();
      if (settings?.contactWhatsapp) {
        whatsappNumber = settings.contactWhatsapp || whatsappNumber;
      }
    } catch (error) {
      console.log('Erro ao buscar configurações, usando número padrão');
    }

    // Enviar WhatsApp automático via API
    try {
      const WhatsAppService = (await import('@/lib/whatsapp')).default;

      const whatsappResult = await WhatsAppService.sendMessage({
        to: whatsappNumber,
        text: message,
        provider: 'auto'
      });

      console.log('WhatsApp agendamento enviado:', whatsappResult);
    } catch (whatsappError) {
      console.error('Erro ao enviar WhatsApp de agendamento:', whatsappError);
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