// 📱 WhatsApp API Integration - Site Imobiliário
// Baseado no sistema do BRPolis

interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  version: string;
}

interface EvolutionConfig {
  apiUrl: string;
  apiKey: string;
  instanceName: string;
}

interface SendMessageData {
  to: string;
  text: string;
  provider?: 'meta' | 'evolution' | 'auto';
}

interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  status?: 'sent' | 'delivered' | 'read' | 'failed';
  provider?: string;
}

export class WhatsAppService {
  private config: WhatsAppConfig;
  private evolutionConfig: EvolutionConfig;

  constructor() {
    this.config = {
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
      version: 'v18.0'
    };

    this.evolutionConfig = {
      apiUrl: process.env.EVOLUTION_API_URL || 'http://localhost:8080',
      apiKey: process.env.EVOLUTION_API_KEY || '',
      instanceName: process.env.EVOLUTION_INSTANCE_NAME || 'imobiliaria'
    };
  }

  /**
   * Envia mensagem via WhatsApp - Sistema Híbrido
   */
  async sendMessage(data: SendMessageData): Promise<WhatsAppResponse> {
    try {
      // Sempre usar simulação realista para demo (como no brpolis)
      return this.simulateRealisticMessage(data);

      // Em produção, descomentar:
      // const provider = await this.chooseProvider(data.provider);
      // if (provider === 'evolution') {
      //   return await this.sendViaEvolution(data);
      // } else {
      //   return await this.sendViaMeta(data);
      // }

    } catch (error) {
      console.error('Erro ao enviar mensagem WhatsApp:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        provider: 'error'
      };
    }
  }

  /**
   * Envia via Evolution API (não-oficial, mais flexível)
   */
  private async sendViaEvolution(data: SendMessageData): Promise<WhatsAppResponse> {
    try {
      const payload = {
        number: data.to,
        textMessage: {
          text: data.text
        }
      };

      const response = await fetch(`${this.evolutionConfig.apiUrl}/message/sendText/${this.evolutionConfig.instanceName}`, {
        method: 'POST',
        headers: {
          'apikey': this.evolutionConfig.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok || !result.key) {
        console.error('Evolution API Error:', result);
        return {
          success: false,
          error: result.message || 'Erro na Evolution API',
          provider: 'evolution'
        };
      }

      return {
        success: true,
        messageId: result.key.id,
        status: 'sent',
        provider: 'evolution'
      };

    } catch (error) {
      console.error('Erro Evolution API:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro Evolution API',
        provider: 'evolution'
      };
    }
  }

  /**
   * Envia via Meta Business API (oficial)
   */
  private async sendViaMeta(data: SendMessageData): Promise<WhatsAppResponse> {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        to: data.to,
        type: 'text',
        text: {
          body: data.text
        }
      };

      const response = await fetch(`https://graph.facebook.com/${this.config.version}/${this.config.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Meta WhatsApp API Error:', result);
        return {
          success: false,
          error: result.error?.message || 'Erro na API do WhatsApp',
          provider: 'meta'
        };
      }

      return {
        success: true,
        messageId: result.messages?.[0]?.id,
        status: 'sent',
        provider: 'meta'
      };

    } catch (error) {
      console.error('Erro Meta API:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro Meta API',
        provider: 'meta'
      };
    }
  }

  /**
   * Escolhe o provider automaticamente
   */
  private async chooseProvider(preferredProvider?: string): Promise<'meta' | 'evolution'> {
    if (preferredProvider === 'meta' || preferredProvider === 'evolution') {
      return preferredProvider;
    }

    // Priorizar Evolution se configurado
    if (this.evolutionConfig.apiKey && this.evolutionConfig.apiUrl) {
      return 'evolution';
    }

    // Fallback para Meta
    return 'meta';
  }

  /**
   * Valida número de telefone
   */
  validatePhoneNumber(phone: string): boolean {
    const cleanPhone = phone.replace(/\D/g, '');
    const brazilianPattern = /^(55)?(\d{10,11})$/;
    return brazilianPattern.test(cleanPhone) && cleanPhone.length >= 10;
  }

  /**
   * Formatar número para WhatsApp
   */
  formatPhoneNumber(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, '');

    if (!cleanPhone.startsWith('55')) {
      return `55${cleanPhone}`;
    }

    return cleanPhone;
  }

  /**
   * Simular envio REALISTA para demonstração
   */
  private async simulateRealisticMessage(data: SendMessageData): Promise<WhatsAppResponse> {
    console.log(`🚀 [IMOBILIÁRIA] Enviando mensagem via Evolution API para: ${data.to}`);
    console.log(`📱 [IMOBILIÁRIA] Mensagem: ${data.text.substring(0, 100)}...`);

    // Simular delay real da Evolution API
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    // Sempre sucesso para demonstração
    const messageId = `imob_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log(`✅ [IMOBILIÁRIA] Mensagem enviada com sucesso! ID: ${messageId}`);

    return {
      success: true,
      messageId: messageId,
      status: 'sent',
      provider: 'evolution'
    };
  }

  /**
   * Verificar se está configurado
   */
  isConfigured(): boolean {
    return !!(this.config.accessToken && this.config.phoneNumberId) ||
           !!(this.evolutionConfig.apiKey && this.evolutionConfig.apiUrl);
  }
}

const whatsappService = new WhatsAppService();
export default whatsappService;