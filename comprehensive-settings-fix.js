const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function comprehensiveSettingsFix() {
  try {
    console.log('=== CORREÇÃO ABRANGENTE DAS CONFIGURAÇÕES ===')
    
    // 1. Buscar todas as configurações
    const allSettings = await prisma.settings.findMany({
      orderBy: { createdAt: 'asc' }
    })
    
    console.log(`\n1️⃣ Encontradas ${allSettings.length} configuração(ões)`)
    
    if (allSettings.length === 0) {
      console.log('❌ Nenhuma configuração encontrada!')
      return
    }
    
    if (allSettings.length === 1) {
      console.log('✅ Apenas uma configuração encontrada. Sistema correto.')
      console.log(`📌 FeaturedLimit: ${allSettings[0].featuredLimit}`)
      return
    }
    
    // 2. Mostrar o problema
    console.log('\n2️⃣ PROBLEMA IDENTIFICADO: Múltiplas configurações')
    allSettings.forEach((setting, index) => {
      console.log(`   - ID: ${setting.id}, FeaturedLimit: ${setting.featuredLimit}, Nome: ${setting.siteName}`)
    })
    
    // 3. Determinar qual configuração manter
    // Vamos manter a que tem dados mais completos e recentes
    const mostCompleteSetting = allSettings.reduce((best, current) => {
      // Priorizar por dados mais completos e atualizados
      const currentScore = (
        (current.siteName !== 'ImobiNext' ? 1 : 0) + // Nome personalizado
        (current.contactEmail !== 'contato@imobinext.com' ? 1 : 0) + // Email personalizado  
        (current.contactPhone !== '(48) 99864-5864' ? 1 : 0) + // Telefone personalizado
        (new Date(current.updatedAt).getTime() / 1000000) // Tempo de atualização
      )
      
      const bestScore = (
        (best.siteName !== 'ImobiNext' ? 1 : 0) +
        (best.contactEmail !== 'contato@imobinext.com' ? 1 : 0) +
        (best.contactPhone !== '(48) 99864-5864' ? 1 : 0) +
        (new Date(best.updatedAt).getTime() / 1000000)
      )
      
      return currentScore > bestScore ? current : best
    })
    
    console.log(`\n3️⃣ CONFIGURAÇÃO ESCOLHIDA PARA MANTER:`)
    console.log(`   - ID: ${mostCompleteSetting.id}`)
    console.log(`   - Nome: ${mostCompleteSetting.siteName}`)
    console.log(`   - Email: ${mostCompleteSetting.contactEmail}`)
    console.log(`   - Telefone: ${mostCompleteSetting.contactPhone}`)
    console.log(`   - FeaturedLimit: ${mostCompleteSetting.featuredLimit}`)
    console.log(`   - Atualizado em: ${mostCompleteSetting.updatedAt}`)
    
    // 4. Deletar configurações duplicadas
    const idsToDelete = allSettings
      .filter(setting => setting.id !== mostCompleteSetting.id)
      .map(setting => setting.id)
    
    console.log(`\n4️⃣ DELETANDO ${idsToDelete.length} CONFIGURAÇÃO(ÕES) DUPLICADA(S)...`)
    
    for (const id of idsToDelete) {
      await prisma.settings.delete({
        where: { id: id }
      })
      console.log(`   ✅ Deletada configuração ID: ${id}`)
    }
    
    // 5. Verificar resultado final
    const finalSettings = await prisma.settings.findMany()
    console.log(`\n5️⃣ RESULTADO FINAL:`)
    console.log(`   ✅ Total de configurações: ${finalSettings.length}`)
    
    if (finalSettings.length === 1) {
      const finalSetting = finalSettings[0]
      console.log(`   📌 ID: ${finalSetting.id}`)
      console.log(`   📌 Nome: ${finalSetting.siteName}`)
      console.log(`   📌 FeaturedLimit: ${finalSetting.featuredLimit}`)
      console.log(`   📌 Email: ${finalSetting.contactEmail}`)
      console.log(`   📌 Telefone: ${finalSetting.contactPhone}`)
    }
    
    console.log('\n🎉 CORREÇÃO CONCLUÍDA COM SUCESSO!')
    console.log('⚠️  PRÓXIMOS PASSOS:')
    console.log('   1. Teste a página de configurações do admin')
    console.log('   2. Altere o featuredLimit e verifique se persiste')
    console.log('   3. Verifique se a homepage mostra o número correto de imóveis em destaque')
    
  } catch (error) {
    console.error('❌ Erro durante a correção:', error)
  } finally {
    await prisma.$disconnect()
  }
}

comprehensiveSettingsFix()