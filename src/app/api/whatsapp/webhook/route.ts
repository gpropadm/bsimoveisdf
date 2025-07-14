import { NextRequest, NextResponse } from 'next/server';
import { whatsappService } from '@/lib/whatsapp';
import { googleSheetsService } from '@/lib/googleSheets';

export async function POST(request: NextRequest) {
  try {
    const { from, message, timestamp } = await request.json();

    console.log('Mensagem recebida:', { from, message, timestamp });

    // Processar resposta do WhatsApp
    const response = await whatsappService.processWhatsAppResponse(from, message);

    // Lógica adicional baseada na resposta
    const messageLC = message.toLowerCase().trim();

    if (messageLC === 'confirmar') {
      // Confirmar agendamento
      await handleConfirmation(from);
    } else if (messageLC === 'cancelar') {
      // Cancelar agendamento
      await handleCancellation(from);
    } else if (messageLC === 'reagendar') {
      // Reagendar
      await handleReschedule(from);
    } else if (/^\d+$/.test(messageLC)) {
      // Número de opção selecionada
      await handleOptionSelection(from, parseInt(messageLC));
    }

    // Enviar resposta automática
    await whatsappService.sendMessage(from, response);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro no webhook WhatsApp:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

async function handleConfirmation(phoneNumber: string) {
  // Lógica para confirmar agendamento
  console.log(`Confirmando agendamento para ${phoneNumber}`);
  // Atualizar status na planilha ou banco
}

async function handleCancellation(phoneNumber: string) {
  // Lógica para cancelar agendamento
  console.log(`Cancelando agendamento para ${phoneNumber}`);
  
  // Buscar agendamento na planilha pelo telefone
  // await googleSheetsService.cancelSlot(date, time, phoneNumber);
}

async function handleReschedule(phoneNumber: string) {
  // Lógica para reagendar
  console.log(`Reagendando para ${phoneNumber}`);
  
  // Buscar novos horários disponíveis
  const today = new Date().toISOString().split('T')[0];
  const availableSlots = await googleSheetsService.getAvailableSlots(today);
  
  // Enviar opções via WhatsApp
  await whatsappService.notifyClientUnavailable(
    phoneNumber,
    today,
    '',
    availableSlots
  );
}

async function handleOptionSelection(phoneNumber: string, optionNumber: number) {
  // Lógica para processar seleção de opção
  console.log(`Opção ${optionNumber} selecionada por ${phoneNumber}`);
  
  // Agendar a opção selecionada
  // Implementar lógica de agendamento baseada na opção
}

// Verificação webhook (para algumas APIs como WhatsApp Business)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge);
  }

  return NextResponse.json({ error: 'Verificação falhou' }, { status: 403 });
}