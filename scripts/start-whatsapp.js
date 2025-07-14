const { getWhatsAppInstance } = require('../src/lib/whatsapp-baileys');

console.log('🚀 Iniciando WhatsApp...');
console.log('📱 Escaneie o QR Code que aparecerá com seu WhatsApp');

const whatsapp = getWhatsAppInstance();
whatsapp.initialize();

// Manter o processo rodando
process.on('SIGINT', () => {
  console.log('\n👋 Encerrando WhatsApp...');
  process.exit(0);
});

// Teste de mensagem após conexão
setTimeout(() => {
  if (whatsapp.isConnected()) {
    console.log('✅ WhatsApp conectado e pronto para enviar mensagens!');
  } else {
    console.log('⏳ Aguardando conexão com WhatsApp...');
  }
}, 5000);