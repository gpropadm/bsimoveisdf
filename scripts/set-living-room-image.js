const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function setLivingRoomImage() {
  try {
    // Buscar configurações existentes
    const settings = await prisma.settings.findFirst()

    if (!settings) {
      console.log('❌ Nenhuma configuração encontrada.')
      return
    }

    // URL direta da imagem da sala de estar
    const imageUrl = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'

    // Atualizar com a nova imagem
    const updated = await prisma.settings.update({
      where: { id: settings.id },
      data: {
        headerImageUrl: imageUrl,
        headerTitle: 'Encontre o Lar dos Seus Sonhos',
        headerSubtitle: 'Ambientes aconchegantes e bem planejados esperando por você'
      }
    })

    console.log('✅ Imagem da sala de estar configurada!')
    console.log('📸 Nova imagem:', updated.headerImageUrl)
    console.log('📝 Novo título:', updated.headerTitle)
    console.log('📄 Novo subtítulo:', updated.headerSubtitle)

    console.log('\n🎉 Agora você pode acessar o admin e essa imagem já estará configurada!')
    console.log('🔧 Para alterar: /admin/settings > Header Hero')

  } catch (error) {
    console.error('❌ Erro ao configurar imagem:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setLivingRoomImage()