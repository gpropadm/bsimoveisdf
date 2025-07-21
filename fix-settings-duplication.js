const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixSettingsDuplication() {
  try {
    console.log('=== CORRIGINDO DUPLICAÇÃO DE CONFIGURAÇÕES ===')
    
    // Buscar todas as configurações
    const allSettings = await prisma.settings.findMany({
      orderBy: { createdAt: 'asc' }
    })
    
    console.log(`Encontradas ${allSettings.length} configurações`)
    
    if (allSettings.length <= 1) {
      console.log('✅ Não há duplicação. Sistema está correto.')
      return
    }
    
    // Mostrar detalhes de cada configuração
    allSettings.forEach((setting, index) => {
      console.log(`\n--- Configuração ${index + 1} ---`)
      console.log(`ID: ${setting.id}`)
      console.log(`Nome: ${setting.siteName}`)
      console.log(`Email: ${setting.contactEmail}`)
      console.log(`Featured Limit: ${setting.featuredLimit}`)
      console.log(`Criado em: ${setting.createdAt}`)
      console.log(`Atualizado em: ${setting.updatedAt}`)
    })
    
    // Decidir qual configuração manter (a mais recentemente atualizada)
    const latestSetting = allSettings.reduce((latest, current) => {
      return new Date(current.updatedAt) > new Date(latest.updatedAt) ? current : latest
    })
    
    console.log(`\n📌 Configuração mais recente: ID ${latestSetting.id} (featuredLimit: ${latestSetting.featuredLimit})`)
    
    // Confirmar se deve prosseguir
    console.log('\n⚠️  AÇÃO A SER EXECUTADA:')
    console.log(`1. Manter apenas a configuração ID: ${latestSetting.id}`)
    console.log(`2. Deletar ${allSettings.length - 1} configuração(ões) duplicada(s)`)
    console.log(`3. Garantir que o sistema use featuredLimit: ${latestSetting.featuredLimit}`)
    
    // Para executar automaticamente, descomente as linhas abaixo:
    /*
    // Deletar todas as outras configurações
    const idsToDelete = allSettings
      .filter(setting => setting.id !== latestSetting.id)
      .map(setting => setting.id)
    
    if (idsToDelete.length > 0) {
      await prisma.settings.deleteMany({
        where: {
          id: {
            in: idsToDelete
          }
        }
      })
      console.log(`✅ Deletadas ${idsToDelete.length} configuração(ões) duplicada(s)`)
    }
    
    // Verificar resultado
    const remainingSettings = await prisma.settings.findMany()
    console.log(`\n✅ Limpeza concluída. Restam ${remainingSettings.length} configuração(ões)`)
    console.log(`📌 FeaturedLimit atual: ${remainingSettings[0]?.featuredLimit}`)
    */
    
    console.log('\n💡 Para executar a limpeza, descomente as linhas no script e execute novamente.')
    
  } catch (error) {
    console.error('❌ Erro ao corrigir configurações:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixSettingsDuplication()