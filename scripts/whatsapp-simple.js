const makeWASocket = require('@whiskeysockets/baileys').default;
const { DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode-terminal');

console.log('🚀 Iniciando WhatsApp...');
console.log('📱 Escaneie o QR Code que aparecerá com seu WhatsApp');

async function startWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('whatsapp-session');
  
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    
    if (qr) {
      console.log('📱 QR Code gerado! Escaneie com seu WhatsApp:');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Conexão fechada, reconectando...', shouldReconnect);
      
      if (shouldReconnect) {
        startWhatsApp();
      }
    } else if (connection === 'open') {
      console.log('✅ WhatsApp conectado com sucesso!');
      console.log('🎉 Agora as notificações serão enviadas automaticamente!');
      
      // Teste de mensagem (opcional)
      setTimeout(() => {
        console.log('📱 Sistema pronto para enviar notificações!');
      }, 2000);
    }
  });

  sock.ev.on('creds.update', saveCreds);

  // Escutar mensagens recebidas
  sock.ev.on('messages.upsert', async (m) => {
    const message = m.messages[0];
    if (!message.key.fromMe && message.message) {
      const phoneNumber = message.key.remoteJid?.replace('@s.whatsapp.net', '');
      const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
      
      if (text && phoneNumber) {
        console.log(`📱 Mensagem recebida de ${phoneNumber}: ${text}`);
        
        // Aqui você pode processar as respostas do corretor
        if (text.toLowerCase().includes('ok') || text.toLowerCase().includes('confirmar')) {
          console.log('✅ Corretor confirmou agendamento!');
        } else if (text.toLowerCase().includes('negar') || text.toLowerCase().includes('cancelar')) {
          console.log('❌ Corretor negou agendamento!');
        } else if (text.toLowerCase().includes('reagendar')) {
          console.log('📅 Corretor quer reagendar!');
        }
      }
    }
  });

  // Função para enviar mensagem (exemplo)
  global.sendWhatsAppMessage = async (to, message) => {
    try {
      const formattedNumber = to.includes('@') ? to : `${to}@s.whatsapp.net`;
      await sock.sendMessage(formattedNumber, { text: message });
      console.log(`✅ Mensagem enviada para ${to}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      return false;
    }
  };
}

startWhatsApp().catch(console.error);

// Manter o processo rodando
process.on('SIGINT', () => {
  console.log('\n👋 Encerrando WhatsApp...');
  process.exit(0);
});

console.log('\n📋 Instruções:');
console.log('1. Escaneie o QR Code com seu WhatsApp');
console.log('2. Aguarde a confirmação de conexão');
console.log('3. Deixe este terminal aberto');
console.log('4. Teste fazendo um agendamento no site');
console.log('\n⚠️  Mantenha este terminal rodando para receber notificações!');