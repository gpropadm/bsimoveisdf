/* eslint-disable @typescript-eslint/no-explicit-any */
import * as wppconnect from '@wppconnect-team/wppconnect';

class WhatsAppWPPConnect {
  private client: any = null;
  private connected = false;
  private connecting = false;

  async initialize() {
    if (this.connecting || this.connected) {
      console.log('⚠️ WhatsApp já está conectado ou conectando');
      return;
    }

    this.connecting = true;

    try {
      console.log('📱 Iniciando WPPConnect...');

      this.client = await wppconnect.create({
        session: 'modelo-site',
        catchQR: (base64Qr: string, asciiQR: string) => {
          console.log('📱 QR CODE GERADO:');
          console.log(asciiQR);
          console.log('\n📱 Ou acesse: data:image/png;base64,' + base64Qr);
        },
        statusFind: (statusSession: string, session: string) => {
          console.log(`Status da sessão ${session}: ${statusSession}`);

          if (statusSession === 'qrReadSuccess' || statusSession === 'chatsAvailable') {
            this.connected = true;
            this.connecting = false;
            console.log('✅ WhatsApp conectado com sucesso!');
          }
        },
        headless: true,
        devtools: false,
        useChrome: true,
        debug: false,
        logQR: true,
        browserArgs: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ],
        autoClose: 60000,
        disableWelcome: true,
      });

      console.log('✅ Cliente WPPConnect criado com sucesso');
      this.connected = true;
      this.connecting = false;

      // Listeners de eventos
      this.client.onStateChange((state: string) => {
        console.log('Estado mudou:', state);
        if (state === 'CONFLICT' || state === 'UNPAIRED') {
          console.log('❌ Sessão desconectada, reconectando...');
          this.connected = false;
          this.client = null;
        }
      });

    } catch (error) {
      console.error('❌ Erro ao inicializar WPPConnect:', error);
      this.connecting = false;
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
      const formattedNumber = phoneNumber + '@c.us';

      await this.client.sendText(formattedNumber, message);
      console.log(`✅ Mensagem enviada para ${to}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      return false;
    }
  }

  async sendImage(to: string, imagePath: string, caption?: string): Promise<boolean> {
    if (!this.client || !this.connected) {
      console.log('❌ WhatsApp não conectado');
      return false;
    }

    try {
      const phoneNumber = to.replace(/\D/g, '');
      const formattedNumber = phoneNumber + '@c.us';

      await this.client.sendImage(
        formattedNumber,
        imagePath,
        'image',
        caption || ''
      );
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
    title: string
  ): Promise<boolean> {
    if (!this.client || !this.connected) {
      console.log('❌ WhatsApp não conectado');
      return false;
    }

    try {
      const phoneNumber = to.replace(/\D/g, '');
      const formattedNumber = phoneNumber + '@c.us';

      await this.client.sendLocation(
        formattedNumber,
        String(latitude),
        String(longitude),
        title
      );
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
        await this.client.close();
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
let whatsappInstance: WhatsAppWPPConnect | null = null;

export const getWhatsAppInstance = (): WhatsAppWPPConnect => {
  if (!whatsappInstance) {
    whatsappInstance = new WhatsAppWPPConnect();
  }
  return whatsappInstance;
};

export default WhatsAppWPPConnect;
