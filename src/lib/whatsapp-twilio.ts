/**
 * Twilio WhatsApp Integration
 *
 * Custo: ~USD 0.005 por mensagem (~R$ 0.025)
 * Funciona 100% na Vercel
 */

import twilio from 'twilio';

export async function sendWhatsAppMessage(
  phoneNumber: string,
  message: string
): Promise<boolean> {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER; // Ex: whatsapp:+14155238886

    if (!accountSid || !authToken || !twilioWhatsAppNumber) {
      console.log('⚠️ Variáveis Twilio não configuradas');
      return false;
    }

    const client = twilio(accountSid, authToken);

    // Normalizar número
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone;
    const whatsappNumber = `whatsapp:+${formattedPhone}`;

    console.log(`📱 Enviando WhatsApp via Twilio para ${whatsappNumber}...`);

    const messageResponse = await client.messages.create({
      from: twilioWhatsAppNumber,
      to: whatsappNumber,
      body: message
    });

    if (messageResponse.sid) {
      console.log(`✅ Mensagem enviada via Twilio (SID: ${messageResponse.sid})`);
      return true;
    }

    return false;

  } catch (error) {
    console.error('❌ Erro ao enviar via Twilio:', error);
    return false;
  }
}

export default {
  sendWhatsAppMessage
};
