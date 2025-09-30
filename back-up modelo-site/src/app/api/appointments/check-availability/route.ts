import { NextRequest, NextResponse } from 'next/server';
import { googleSheetsService } from '@/lib/googleSheets';

export async function POST(request: NextRequest) {
  try {
    const { date } = await request.json();

    if (!date) {
      return NextResponse.json(
        { error: 'Data é obrigatória' },
        { status: 400 }
      );
    }

    // Buscar horários padrão
    const defaultSlots = [
      { data: date, hora: '09:00', corretor: 'João Silva', status: 'disponível' },
      { data: date, hora: '10:00', corretor: 'João Silva', status: 'disponível' },
      { data: date, hora: '11:00', corretor: 'João Silva', status: 'disponível' },
      { data: date, hora: '14:00', corretor: 'Ana Costa', status: 'disponível' },
      { data: date, hora: '15:00', corretor: 'Ana Costa', status: 'disponível' },
      { data: date, hora: '16:00', corretor: 'Ana Costa', status: 'disponível' },
      { data: date, hora: '17:00', corretor: 'João Silva', status: 'disponível' },
      { data: date, hora: '18:00', corretor: 'João Silva', status: 'disponível' }
    ];

    // Verificar no banco de dados quais horários estão ocupados
    let availableSlots = defaultSlots;
    try {
      const prisma = (await import('@/lib/prisma')).default;
      
      // Buscar agendamentos existentes na data
      const existingAppointments = await prisma.appointment.findMany({
        where: {
          scheduledDate: {
            gte: new Date(`${date}T00:00:00`),
            lte: new Date(`${date}T23:59:59`)
          },
          status: {
            not: 'cancelado'
          }
        }
      });

      // Marcar horários ocupados
      availableSlots = defaultSlots.map(slot => {
        const isOccupied = existingAppointments.some(appointment => {
          const appointmentTime = new Date(appointment.scheduledDate).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          });
          return appointmentTime === slot.hora;
        });
        
        return {
          ...slot,
          status: isOccupied ? 'ocupado' : 'disponível'
        };
      }).filter(slot => slot.status === 'disponível'); // Só retornar disponíveis

    } catch {
      console.log('Erro ao verificar banco de dados, usando horários padrão');
    }

    // Tentar buscar horários no Google Sheets (opcional)
    try {
      const googleSlots = await googleSheetsService.getAvailableSlots(date);
      // Se Google Sheets funcionar, usar os dados dele
      availableSlots = googleSlots;
    } catch {
      console.log('Google Sheets não configurado');
    }
    
    return NextResponse.json({
      available: availableSlots.length > 0,
      message: availableSlots.length > 0 ? 'Horários disponíveis' : 'Nenhum horário disponível',
      availableSlots: availableSlots
    });
  } catch (error) {
    console.error('Erro ao verificar disponibilidade:', error);
    
    // Fallback final - garantir que sempre funcione
    const defaultSlots = [
      { data: date || new Date().toISOString().split('T')[0], hora: '09:00', corretor: 'João Silva', status: 'disponível' },
      { data: date || new Date().toISOString().split('T')[0], hora: '10:00', corretor: 'João Silva', status: 'disponível' },
      { data: date || new Date().toISOString().split('T')[0], hora: '11:00', corretor: 'João Silva', status: 'disponível' },
      { data: date || new Date().toISOString().split('T')[0], hora: '14:00', corretor: 'Ana Costa', status: 'disponível' },
      { data: date || new Date().toISOString().split('T')[0], hora: '15:00', corretor: 'Ana Costa', status: 'disponível' },
      { data: date || new Date().toISOString().split('T')[0], hora: '16:00', corretor: 'Ana Costa', status: 'disponível' },
      { data: date || new Date().toISOString().split('T')[0], hora: '17:00', corretor: 'João Silva', status: 'disponível' },
      { data: date || new Date().toISOString().split('T')[0], hora: '18:00', corretor: 'João Silva', status: 'disponível' }
    ];
    
    return NextResponse.json({
      available: true,
      message: 'Horários disponíveis (modo offline)',
      availableSlots: defaultSlots,
      offline: true
    });
  }
}