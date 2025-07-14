import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState, 
  WAMessageKey, 
  WASocket 
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode-terminal';

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

class WhatsAppBaileys {
  private sock: WASocket | null = null;
  private connected = false;

  async initialize() {
    try {
      const { state, saveCreds } = await useMultiFileAuthState('whatsapp-session');
      
      this.sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: {
          level: 'silent',
          child: () => ({ level: 'silent' } as any)
        } as any
      });

      this.sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
          console.log('📱 Escaneie o QR Code com seu WhatsApp:');
          qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
          const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
          console.log('Conexão fechada, reconectando...', shouldReconnect);
          
          if (shouldReconnect) {
            this.initialize();
          }
        } else if (connection === 'open') {
          console.log('✅ WhatsApp conectado com sucesso!');
          this.connected = true;
        }
      });

      this.sock.ev.on('creds.update', saveCreds);

      // Escutar mensagens recebidas
      this.sock.ev.on('messages.upsert', async (m) => {
        const message = m.messages[0];
        if (!message.key.fromMe && message.message) {
          await this.handleIncomingMessage(message);
        }
      });

    } catch (error) {
      console.error('Erro ao inicializar WhatsApp:', error);
    }
  }

  private async handleIncomingMessage(message: any) {
    const phoneNumber = message.key.remoteJid?.replace('@s.whatsapp.net', '');
    const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
    
    if (text && phoneNumber) {
      console.log(`📱 Mensagem recebida de ${phoneNumber}: ${text}`);
      
      // Processar resposta do corretor/cliente
      await this.processResponse(phoneNumber, text);
    }
  }

  private async processResponse(phoneNumber: string, text: string) {
    const response = text.toLowerCase().trim();
    
    try {
      // Fazer requisição para o webhook interno
      const webhookResponse = await fetch(`${process.env.SITE_URL}/api/whatsapp/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: phoneNumber,
          message: text,
          timestamp: new Date().toISOString()
        })
      });

      if (webhookResponse.ok) {
        const result = await webhookResponse.json();
        console.log('✅ Resposta processada:', result);
      }
    } catch (error) {
      console.error('Erro ao processar resposta:', error);
    }
  }

  async sendMessage(to: string, message: string): Promise<boolean> {
    if (!this.sock || !this.connected) {
      console.log('❌ WhatsApp não conectado');
      return false;
    }

    try {
      // Formatar número (adicionar @s.whatsapp.net se necessário)
      const formattedNumber = to.includes('@') ? to : `${to}@s.whatsapp.net`;
      
      await this.sock.sendMessage(formattedNumber, { text: message });
      console.log(`✅ Mensagem enviada para ${to}`);
      return true;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
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
✅ *OK* - para confirmar
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

  isConnected(): boolean {
    return this.connected;
  }
}

// Singleton instance
let whatsappInstance: WhatsAppBaileys | null = null;

export const getWhatsAppInstance = (): WhatsAppBaileys => {
  if (!whatsappInstance) {
    whatsappInstance = new WhatsAppBaileys();
  }
  return whatsappInstance;
};

export default WhatsAppBaileys;