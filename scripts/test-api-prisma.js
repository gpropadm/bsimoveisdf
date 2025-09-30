const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testApiPrisma() {
  try {
    console.log('🧪 Testando conexão do Prisma...')

    // Mesmo query que a API usa
    const settings = await prisma.settings.findFirst({
      orderBy: { createdAt: 'asc' }
    })

    console.log('📋 Settings encontradas:', settings ? 'SIM' : 'NÃO')

    if (settings) {
      console.log('✅ Dados encontrados:')
      console.log('   • ID:', settings.id)
      console.log('   • Header Image URL:', settings.headerImageUrl)
      console.log('   • Header Title:', settings.headerTitle)
      console.log('   • Header Subtitle:', settings.headerSubtitle)
    } else {
      console.log('❌ Nenhuma configuração encontrada!')

      // Verificar se há dados na tabela
      const count = await prisma.settings.count()
      console.log('📊 Total de registros na tabela settings:', count)
    }

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testApiPrisma()