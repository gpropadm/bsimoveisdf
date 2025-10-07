/**
 * CallMeBot WhatsApp Integration (GRATUITO)
 *
 * Como configurar:
 * 1. Adicione o número +34 644 44 71 79 nos seus contatos como "CallMeBot"
 * 2. Envie mensagem: "I allow callmebot to send me messages"
 * 3. Você receberá sua API Key
 * 4. Adicione CALLMEBOT_API_KEY no .env
 */

interface CallMeBotResponse {
  success: boolean;
  error?: string;
}

export async function sendWhatsAppMessage(
  phoneNumber: string,
  message: string
): Promise<boolean> {
  try {
    const apiKey = process.env.CALLMEBOT_API_KEY;

    if (!apiKey) {
      console.log('⚠️ CALLMEBOT_API_KEY não configurada');
      return false;
    }

    // Normalizar número (remover caracteres especiais)
    const cleanPhone = phoneNumber.replace(/\D/g, '');

    // CallMeBot espera número no formato internacional sem +
    // Ex: 5561996900444
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone;

    // Encode mensagem para URL
    const encodedMessage = encodeURIComponent(message);

    // URL da API CallMeBot
    const url = `https://api.callmebot.com/whatsapp.php?phone=${formattedPhone}&text=${encodedMessage}&apikey=${apiKey}`;

    console.log(`📱 Enviando WhatsApp via CallMeBot para ${formattedPhone}...`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      console.log('✅ Mensagem WhatsApp enviada via CallMeBot');
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ Erro CallMeBot:', errorText);
      return false;
    }

  } catch (error) {
    console.error('❌ Erro ao enviar via CallMeBot:', error);
    return false;
  }
}

export default {
  sendWhatsAppMessage
};
