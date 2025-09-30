const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixHeaderBack() {
  try {
    console.log('🔧 Revertendo configurações do header...')

    const settings = await prisma.settings.findFirst()

    if (settings) {
      // Voltar para as configurações originais mais simples
      await prisma.settings.update({
        where: { id: settings.id },
        data: {
          headerImageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2058&q=80',
          headerTitle: 'Para você morar bem',
          headerSubtitle: 'Escolher seu imóvel online nunca foi tão fácil como na Arbo'
        }
      })

      console.log('✅ Header revertido para configuração original!')
      console.log('📸 Imagem: Casa moderna (original)')
      console.log('📝 Título: Para você morar bem')
      console.log('📄 Subtítulo: Escolher seu imóvel online nunca foi tão fácil como na Arbo')
    }

  } catch (error) {
    console.error('❌ Erro ao reverter header:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixHeaderBack()