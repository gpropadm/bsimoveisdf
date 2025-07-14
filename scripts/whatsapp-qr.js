const makeWASocket = require('@whiskeysockets/baileys').default;
const { DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode-terminal');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando WhatsApp...');
console.log('📱 Aguarde o QR Code ser gerado...');

async function startWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('whatsapp-session');
  
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false, // Desabilitar terminal QR
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;
    
    if (qr) {
      console.log('📱 QR Code gerado!');
      
      // Mostrar no terminal
      console.log('\n🖥️  QR Code no terminal:');
      qrcode.generate(qr, { small: true });
      
      // Salvar como imagem
      try {
        const qrPath = path.join(__dirname, '../public/whatsapp-qr.png');
        await QRCode.toFile(qrPath, qr);
        console.log('\n📷 QR Code salvo como imagem em: public/whatsapp-qr.png');
        console.log('🌐 Acesse: http://localhost:3000/whatsapp-qr.png');
      } catch (error) {
        console.error('❌ Erro ao salvar QR Code:', error);
      }
      
      // Também criar QR Code maior no terminal
      console.log('\n🔍 QR Code GRANDE:');
      qrcode.generate(qr, { small: false });
      
      console.log('\n📋 Como escanear:');
      console.log('1. Abra WhatsApp no seu celular');
      console.log('2. Vá em Menu → Dispositivos conectados');
      console.log('3. Clique em "Conectar dispositivo"');
      console.log('4. Escaneie o QR Code acima OU acesse: http://localhost:3000/whatsapp-qr.png');
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('🔄 Conexão fechada, reconectando...', shouldReconnect);
      
      if (shouldReconnect) {
        setTimeout(startWhatsApp, 3000); // Aguardar 3 segundos antes de reconectar
      }
    } else if (connection === 'open') {
      console.log('\n✅ WhatsApp conectado com sucesso!');
      console.log('🎉 Sistema pronto para enviar notificações!');
      console.log('📱 Agora teste fazendo um agendamento no site!');
      
      // Remover QR Code salvo
      try {
        const qrPath = path.join(__dirname, '../public/whatsapp-qr.png');
        if (fs.existsSync(qrPath)) {
          fs.unlinkSync(qrPath);
          console.log('🗑️  QR Code removido (não precisa mais)');
        }
      } catch (error) {
        console.log('ℹ️  Não foi possível remover QR Code');
      }
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
        console.log(`\n📱 Mensagem recebida de ${phoneNumber}:`);
        console.log(`💬 "${text}"`);
        
        // Processar respostas do corretor
        const response = text.toLowerCase().trim();
        if (response.includes('ok') || response.includes('confirmar')) {
          console.log('✅ Corretor CONFIRMOU agendamento!');
        } else if (response.includes('negar') || response.includes('cancelar')) {
          console.log('❌ Corretor NEGOU agendamento!');
        } else if (response.includes('reagendar')) {
          console.log('📅 Corretor quer REAGENDAR!');
        }
      }
    }
  });

  // Função global para enviar mensagens
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
  
  // Remover QR Code se existir
  try {
    const qrPath = path.join(__dirname, '../public/whatsapp-qr.png');
    if (fs.existsSync(qrPath)) {
      fs.unlinkSync(qrPath);
    }
  } catch (error) {
    // Ignorar erro
  }
  
  process.exit(0);
});

console.log('\n⏳ Aguardando QR Code ser gerado...');
console.log('🔄 Se não aparecer, aguarde alguns segundos...');