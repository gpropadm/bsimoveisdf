/**
 * WhatsApp Integration com fallback Twilio → UltraMsg
 */

async function sendViaUltraMsg(
  phoneNumber: string,
  message: string,
  mediaUrl?: string
): Promise<boolean> {
  try {
    const instanceId = process.env.ULTRAMSG_INSTANCE_ID;
    const token = process.env.ULTRAMSG_TOKEN;

    if (!instanceId || !token) {
      console.log('⚠️ UltraMsg não configurado');
      return false;
    }

    // Normalizar número para UltraMsg (formato: 5561996900444)
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone;

    console.log(`📱 Enviando WhatsApp via UltraMsg para ${formattedPhone}...`);

    const url = `https://api.ultramsg.com/${instanceId}/messages/chat`;

    const body: any = {
      token,
      to: formattedPhone,
      body: message
    };

    // Se tiver imagem, envia como mídia
    if (mediaUrl) {
      body.image = mediaUrl;
      body.caption = message;
      console.log(`📷 Enviando com imagem: ${mediaUrl}`);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Mensagem enviada via UltraMsg:`, data);
      return true;
    } else {
      const error = await response.text();
      console.error('❌ Erro UltraMsg:', error);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao enviar via UltraMsg:', error);
    return false;
  }
}

export async function sendWhatsAppMessage(
  phoneNumber: string,
  message: string,
  mediaUrl?: string
): Promise<boolean> {
  // Tentar Twilio primeiro (para leads e agendamentos que já funcionam)
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    if (accountSid && authToken && twilioWhatsAppNumber) {
      // Normalizar número
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone;
      const whatsappNumber = `whatsapp:+${formattedPhone}`;

      console.log(`📱 Tentando Twilio para ${whatsappNumber}...`);

      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

      const params: Record<string, string> = {
        From: twilioWhatsAppNumber,
        To: whatsappNumber,
        Body: message
      };

      if (mediaUrl) {
        params.MediaUrl = mediaUrl;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(params)
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Enviado via Twilio (SID: ${data.sid})`);
        return true;
      } else {
        const error = await response.text();
        console.log(`⚠️ Twilio falhou, tentando UltraMsg... Erro:`, error);
      }
    } else {
      console.log('⚠️ Twilio não configurado, usando UltraMsg');
    }
  } catch (error) {
    console.log('⚠️ Erro no Twilio, tentando UltraMsg:', error);
  }

  // Fallback para UltraMsg
  console.log('🔄 Usando UltraMsg como alternativa...');
  return await sendViaUltraMsg(phoneNumber, message, mediaUrl);
}

export default {
  sendWhatsAppMessage
};
