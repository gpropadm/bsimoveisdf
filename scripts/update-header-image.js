const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateHeaderImage() {
  try {
    // Buscar configurações existentes
    const settings = await prisma.settings.findFirst()

    if (!settings) {
      console.log('❌ Nenhuma configuração encontrada. Execute primeiro o script create-default-settings.js')
      return
    }

    // Atualizar com a nova imagem
    const updated = await prisma.settings.update({
      where: { id: settings.id },
      data: {
        headerImageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2058&q=80',
        headerTitle: 'Para você morar bem',
        headerSubtitle: 'Escolher seu imóvel online nunca foi tão fácil como na Arbo'
      }
    })

    console.log('✅ Imagem do header atualizada!')
    console.log('📸 Nova imagem:', updated.headerImageUrl)
    console.log('📝 Novo título:', updated.headerTitle)
    console.log('📄 Novo subtítulo:', updated.headerSubtitle)
  } catch (error) {
    console.error('❌ Erro ao atualizar imagem:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateHeaderImage()