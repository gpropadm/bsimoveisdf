import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const date = searchParams.get('date');

    if (!propertyId || !date) {
      return NextResponse.json(
        { error: 'PropertyId e date são obrigatórios' },
        { status: 400 }
      );
    }

    // Horários de funcionamento (9h às 18h)
    const workingHours = {
      start: 9,
      end: 18,
      interval: 60 // minutos
    };

    // Buscar agendamentos existentes para o dia
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        propertyId,
        scheduledDate: {
          gte: new Date(`${date}T00:00:00`),
          lte: new Date(`${date}T23:59:59`)
        },
        status: {
          not: 'cancelado'
        }
      },
      select: {
        scheduledDate: true,
        duration: true
      }
    });

    // Gerar horários disponíveis
    const availableTimes = [];
    const selectedDate = new Date(date);
    const now = new Date();
    
    // Não permitir agendamentos no passado
    const isToday = selectedDate.toDateString() === now.toDateString();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    for (let hour = workingHours.start; hour < workingHours.end; hour++) {
      const timeSlot = new Date(selectedDate);
      timeSlot.setHours(hour, 0, 0, 0);

      // Verificar se o horário já passou (apenas para hoje)
      if (isToday && (hour < currentHour || (hour === currentHour && currentMinute > 0))) {
        continue;
      }

      // Verificar se há conflito com agendamentos existentes
      const hasConflict = existingAppointments.some(appointment => {
        const appointmentStart = new Date(appointment.scheduledDate);
        const appointmentEnd = new Date(appointmentStart.getTime() + appointment.duration * 60000);
        
        return (
          timeSlot >= appointmentStart && 
          timeSlot < appointmentEnd
        );
      });

      if (!hasConflict) {
        availableTimes.push({
          time: timeSlot.toISOString(),
          displayTime: `${hour.toString().padStart(2, '0')}:00`,
          available: true
        });
      }
    }

    return NextResponse.json({
      date,
      availableTimes,
      workingHours
    });
  } catch (error) {
    console.error('Erro ao buscar horários disponíveis:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}