require('dotenv').config()

console.log('🔍 Verificando variáveis de ambiente:')
console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? '✅ Configurado' : '❌ Não configurado')
console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? '✅ Configurado' : '❌ Não configurado')
console.log('TWILIO_WHATSAPP_NUMBER:', process.env.TWILIO_WHATSAPP_NUMBER ? '✅ Configurado' : '❌ Não configurado')
console.log('WHATSAPP_ADMIN_PHONE:', process.env.WHATSAPP_ADMIN_PHONE ? '✅ Configurado' : '❌ Não configurado')

if (process.env.TWILIO_ACCOUNT_SID) {
  console.log('\n📱 Valores:')
  console.log('Account SID:', process.env.TWILIO_ACCOUNT_SID)
  console.log('WhatsApp Number:', process.env.TWILIO_WHATSAPP_NUMBER)
  console.log('Admin Phone:', process.env.WHATSAPP_ADMIN_PHONE)
}
