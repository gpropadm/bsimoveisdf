/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

class WhatsAppWebJS {
  private client: Client | null = null;
  private connected = false;
  private initializing = false;

  async initialize() {
    if (this.initializing || this.connected) {
      console.log('⚠️ WhatsApp já está conectado ou inicializando');
      return;
    }

    this.initializing = true;

    try {
      console.log('📱 Iniciando WhatsApp Web.js...');

      this.client = new Client({
        authStrategy: new LocalAuth({
          clientId: 'modelo-site'
        }),
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
          ]
        }
      });

      // QR Code
      this.client.on('qr', (qr: string) => {
        console.log('📱 QR CODE GERADO - Escaneie com WhatsApp:');
        qrcode.generate(qr, { small: true });
      });

      // Autenticado
      this.client.on('authenticated', () => {
        console.log('✅ WhatsApp autenticado!');
      });

      // Conectado
      this.client.on('ready', () => {
        console.log('✅ WhatsApp Web.js conectado e pronto!');
        this.connected = true;
        this.initializing = false;
      });

      // Desconectado
      this.client.on('disconnected', (reason: string) => {
        console.log('❌ WhatsApp desconectado:', reason);
        this.connected = false;
        this.client = null;
      });

      // Erro de autenticação
      this.client.on('auth_failure', (msg: string) => {
        console.error('❌ Falha na autenticação:', msg);
        this.connected = false;
        this.initializing = false;
      });

      // Iniciar cliente
      await this.client.initialize();

    } catch (error) {
      console.error('❌ Erro ao inicializar WhatsApp Web.js:', error);
      this.initializing = false;
      this.connected = false;
      throw error;
    }
  }

  async sendMessage(to: string, message: string): Promise<boolean> {
    if (!this.client || !this.connected) {
      console.log('❌ WhatsApp não conectado');
      return false;
    }

    try {
      // Normalizar número
      const phoneNumber = to.replace(/\D/g, '');
      const chatId = phoneNumber + '@c.us';

      await this.client.sendMessage(chatId, message);
      console.log(`✅ Mensagem enviada para ${to}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      return false;
    }
  }

  async sendImage(to: string, imageUrl: string, caption?: string): Promise<boolean> {
    if (!this.client || !this.connected) {
      console.log('❌ WhatsApp não conectado');
      return false;
    }

    try {
      const phoneNumber = to.replace(/\D/g, '');
      const chatId = phoneNumber + '@c.us';

      const { MessageMedia } = await import('whatsapp-web.js');
      const media = await MessageMedia.fromUrl(imageUrl);

      await this.client.sendMessage(chatId, media, { caption });
      console.log(`✅ Imagem enviada para ${to}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar imagem:', error);
      return false;
    }
  }

  async sendLocation(
    to: string,
    latitude: number,
    longitude: number,
    description?: string
  ): Promise<boolean> {
    if (!this.client || !this.connected) {
      console.log('❌ WhatsApp não conectado');
      return false;
    }

    try {
      const phoneNumber = to.replace(/\D/g, '');
      const chatId = phoneNumber + '@c.us';

      const { Location } = await import('whatsapp-web.js');
      const location = new Location(latitude, longitude, description);

      await this.client.sendMessage(chatId, location);
      console.log(`✅ Localização enviada para ${to}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar localização:', error);
      return false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  async close() {
    if (this.client) {
      try {
        await this.client.destroy();
        this.connected = false;
        this.client = null;
        console.log('✅ Conexão WhatsApp fechada');
      } catch (error) {
        console.error('❌ Erro ao fechar conexão:', error);
      }
    }
  }
}

// Singleton instance
let whatsappInstance: WhatsAppWebJS | null = null;

export const getWhatsAppInstance = (): WhatsAppWebJS => {
  if (!whatsappInstance) {
    whatsappInstance = new WhatsAppWebJS();
  }
  return whatsappInstance;
};

export default WhatsAppWebJS;
