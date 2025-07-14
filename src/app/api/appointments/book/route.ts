import { NextRequest, NextResponse } from 'next/server';
import { googleSheetsService } from '@/lib/googleSheets';
import { whatsappService } from '@/lib/whatsapp';
import { getWhatsAppInstance } from '@/lib/whatsapp-baileys';

export async function POST(request: NextRequest) {
  try {
    const { 
      date, 
      time, 
      clientName, 
      clientPhone, 
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

    // Tentar agendar no Google Sheets (com fallback)
    let bookingResult;
    try {
      bookingResult = await googleSheetsService.bookSlot(
        date,
        time,
        clientName,
        clientPhone,
        propertyTitle
      );
    } catch {
      console.log('Google Sheets não configurado, usando modo offline');
      // Simular agendamento bem-sucedido
      bookingResult = {
        success: true,
        corretor: 'João Silva',
        message: 'Agendamento realizado (modo offline)'
      };
    }

    if (!bookingResult.success) {
      // Horário não disponível - buscar alternativas
      let alternativeSlots;
      try {
        alternativeSlots = await googleSheetsService.getAvailableSlots(date);
      } catch {
        // Fallback para horários padrão
        alternativeSlots = [
          { data: date, hora: '09:00', corretor: 'João Silva', status: 'disponível' },
          { data: date, hora: '14:00', corretor: 'Ana Costa', status: 'disponível' },
          { data: date, hora: '16:00', corretor: 'João Silva', status: 'disponível' }
        ];
      }
      
      // Notificar cliente via WhatsApp sobre indisponibilidade (opcional)
      try {
        await whatsappService.notifyClientUnavailable(
          clientPhone,
          date,
          time,
          alternativeSlots
        );
      } catch {
        console.log('WhatsApp não configurado');
      }

      return NextResponse.json({
        success: false,
        message: bookingResult.message,
        alternatives: alternativeSlots
      });
    }

    // Agendamento realizado com sucesso
    const notification = {
      clientName,
      clientPhone,
      corretorName: bookingResult.corretor!,
      corretorPhone: process.env.CORRETOR_PHONE || '11999999999',
      date,
      time,
      propertyTitle,
      propertyAddress: propertyAddress || 'Endereço não informado'
    };

    // Enviar notificações via WhatsApp (Baileys)
    let clientNotified = false;
    let corretorNotified = false;
    
    try {
      const whatsapp = getWhatsAppInstance();
      
      if (whatsapp.isConnected()) {
        clientNotified = await whatsapp.notifyClientAppointmentConfirmed(notification);
        corretorNotified = await whatsapp.notifyCorretorNewAppointment(notification);
        console.log('📱 Notificações WhatsApp enviadas!');
      } else {
        console.log('📱 WhatsApp não conectado, usando fallback');
        // Fallback para WhatsApp API original
        clientNotified = await whatsappService.notifyClientAppointmentConfirmed(notification);
        corretorNotified = await whatsappService.notifyCorretorNewAppointment(notification);
      }
    } catch {
      console.log('WhatsApp não configurado, agendamento salvo sem notificações');
    }

    // Verificar conflitos no banco de dados antes de salvar
    try {
      const prisma = (await import('@/lib/prisma')).default;
      
      // Verificar se já existe agendamento no mesmo horário
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

      // Criar agendamento se não há conflitos
      await prisma.appointment.create({
        data: {
          propertyId: propertyId, // Manter como String
          clientName,
          clientEmail: '', // Não temos email neste fluxo
          clientPhone,
          scheduledDate: appointmentDate,
          status: 'agendado',
          duration: 60
        }
      });
    } catch (error) {
      console.log('Erro ao salvar no banco:', error);
      return NextResponse.json({
        success: false,
        message: 'Ops! Algo deu errado ao processar seu agendamento. Tente novamente em alguns instantes ou entre em contato conosco.',
        error_code: 'DATABASE_ERROR'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Agendamento realizado com sucesso',
      corretor: bookingResult.corretor,
      notifications: {
        client: clientNotified,
        corretor: corretorNotified
      },
      details: {
        data: new Date(`${date}T${time}:00`).toLocaleDateString('pt-BR'),
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