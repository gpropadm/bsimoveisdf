const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function setHeaderImageSofa() {
  try {
    // Buscar configurações existentes
    const settings = await prisma.settings.findFirst()

    if (!settings) {
      console.log('❌ Nenhuma configuração encontrada.')
      return
    }

    // URL da imagem do Unsplash que você mencionou
    const imageUrl = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'

    // Atualizar com a nova imagem
    const updated = await prisma.settings.update({
      where: { id: settings.id },
      data: {
        headerImageUrl: imageUrl,
        headerTitle: 'Encontre o Imóvel dos Seus Sonhos',
        headerSubtitle: 'Casas, apartamentos e terrenos com o conforto que você merece'
      }
    })

    console.log('✅ Imagem do header atualizada para a sala de estar!')
    console.log('📸 Nova imagem:', updated.headerImageUrl)
    console.log('📝 Novo título:', updated.headerTitle)
    console.log('📄 Novo subtítulo:', updated.headerSubtitle)
  } catch (error) {
    console.error('❌ Erro ao atualizar imagem:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setHeaderImageSofa()