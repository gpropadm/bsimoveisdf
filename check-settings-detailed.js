const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkSettingsDetailed() {
  try {
    console.log('=== CONFIGURAÇÕES DETALHADAS ===')
    const settings = await prisma.settings.findMany()
    console.log('Total de registros de configurações:', settings.length)
    
    settings.forEach((setting, index) => {
      console.log(`\n--- Configuração ${index + 1} ---`)
      console.log(`ID: ${setting.id}`)
      console.log(`Nome do Site: ${setting.siteName}`)
      console.log(`Email de Contato: ${setting.contactEmail}`)
      console.log(`Telefone: ${setting.contactPhone}`)
      console.log(`WhatsApp: ${setting.contactWhatsapp}`)
      console.log(`Cidade: ${setting.city}`)
      console.log(`Estado: ${setting.state}`)
      console.log(`Endereço: ${setting.address}`)
      console.log(`Facebook: ${setting.socialFacebook}`)
      console.log(`Instagram: ${setting.socialInstagram}`)
      console.log(`LinkedIn: ${setting.socialLinkedin}`)
      console.log(`FEATURED LIMIT: ${setting.featuredLimit}`)
      console.log(`Registros habilitados: ${setting.enableRegistrations}`)
      console.log(`Comentários habilitados: ${setting.enableComments}`)
      console.log(`Criado em: ${setting.createdAt}`)
      console.log(`Atualizado em: ${setting.updatedAt}`)
    })

    console.log('\n=== ANÁLISE ===')
    if (settings.length > 1) {
      console.log('⚠️  PROBLEMA ENCONTRADO: Existem múltiplos registros de configurações!')
      console.log('Isso pode causar problemas de persistência.')
      console.log('O sistema deveria ter apenas UM registro de configurações.')
    }

    // Mostrar qual configuração o sistema está usando
    const firstSetting = await prisma.settings.findFirst()
    if (firstSetting) {
      console.log(`\n📌 O sistema está usando a configuração com ID: ${firstSetting.id}`)
      console.log(`📌 FeaturedLimit atual sendo usado: ${firstSetting.featuredLimit}`)
    }

  } catch (error) {
    console.error('Erro ao consultar configurações:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSettingsDetailed()