import axios from 'axios';

interface WhatsAppMessage {
  to: string;
  message: string;
}

interface AppointmentNotification {
  clientName: string;
  clientPhone: string;
  corretorName: string;
  corretorPhone: string;
  date: string;
  time: string;
  propertyTitle: string;
  propertyAddress: string;
}

export class WhatsAppService {
  private apiUrl: string;
  private token: string;

  constructor() {
    // Configurar com sua API do WhatsApp (Twilio, Baileys, etc.)
    this.apiUrl = process.env.WHATSAPP_API_URL || '';
    this.token = process.env.WHATSAPP_API_TOKEN || '';
  }

  // Enviar mensagem genérica
  async sendMessage(to: string, message: string): Promise<boolean> {
    try {
      const response = await axios.post(`${this.apiUrl}/send`, {
        to,
        message,
      }, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.status === 200;
    } catch (error) {
      console.error('Erro ao enviar mensagem WhatsApp:', error);
      return false;
    }
  }

  // Notificar cliente sobre agendamento confirmado
  async notifyClientAppointmentConfirmed(notification: AppointmentNotification): Promise<boolean> {
    const message = `
✅ *Agendamento Confirmado!*

📅 *Data:* ${this.formatDate(notification.date)}
⏰ *Hora:* ${notification.time}
🏠 *Imóvel:* ${notification.propertyTitle}
📍 *Endereço:* ${notification.propertyAddress}

👤 *Corretor:* ${notification.corretorName}
📞 *Contato Corretor:* ${notification.corretorPhone}

---
*Responda:*
✅ *CONFIRMAR* - para confirmar presença
📅 *REAGENDAR* - para reagendar
❌ *CANCELAR* - para cancelar

_Agendado através do ImobiNext_
    `.trim();

    return await this.sendMessage(notification.clientPhone, message);
  }

  // Notificar corretor sobre novo agendamento
  async notifyCorretorNewAppointment(notification: AppointmentNotification): Promise<boolean> {
    const message = `
📋 *Novo Agendamento!*

👤 *Cliente:* ${notification.clientName}
📞 *Telefone:* ${notification.clientPhone}
📅 *Data:* ${this.formatDate(notification.date)}
⏰ *Hora:* ${notification.time}

🏠 *Imóvel:* ${notification.propertyTitle}
📍 *Endereço:* ${notification.propertyAddress}

---
*Responda:*
✅ *CONFIRMAR* - para confirmar
❌ *NEGAR* - para negar
📅 *REAGENDAR* - para sugerir novo horário

_Sistema ImobiNext_
    `.trim();

    return await this.sendMessage(notification.corretorPhone, message);
  }

  // Notificar cliente sobre horário indisponível
  async notifyClientUnavailable(
    clientPhone: string, 
    requestedDate: string, 
    requestedTime: string,
    alternativeSlots: Array<{date: string, time: string, corretor: string}>
  ): Promise<boolean> {
    let message = `
❌ *Horário Indisponível*

O horário solicitado (${this.formatDate(requestedDate)} às ${requestedTime}) não está disponível.

✨ *Horários Alternativos:*
`;

    alternativeSlots.slice(0, 5).forEach((slot, index) => {
      message += `\n${index + 1}. ${this.formatDate(slot.date)} às ${slot.time} - ${slot.corretor}`;
    });

    message += `\n\n*Responda com o número* da opção desejada ou *CANCELAR* para desistir.`;

    return await this.sendMessage(clientPhone, message);
  }

  // Processar respostas do WhatsApp
  async processWhatsAppResponse(from: string, message: string): Promise<string> {
    const response = message.toLowerCase().trim();

    // Implementar lógica de resposta inteligente (RAG)
    switch (response) {
      case 'confirmar':
        return 'Obrigado! Seu agendamento foi confirmado. Nos vemos no horário marcado!';
      
      case 'cancelar':
        return 'Agendamento cancelado com sucesso. Se precisar reagendar, é só entrar em contato!';
      
      case 'reagendar':
        return 'Vou verificar novos horários disponíveis. Aguarde um momento...';
      
      default:
        // Verificar se é um número (opção de horário alternativo)
        const optionNumber = parseInt(response);
        if (!isNaN(optionNumber) && optionNumber >= 1 && optionNumber <= 5) {
          return `Perfeito! Vou agendar a opção ${optionNumber} para você. Aguarde a confirmação...`;
        }
        
        return 'Não entendi sua resposta. Responda com: CONFIRMAR, REAGENDAR ou CANCELAR.';
    }
  }

  // Formatar data para exibição
  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}

export const whatsappService = new WhatsAppService();