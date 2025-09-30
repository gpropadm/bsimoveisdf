const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createDefaultSettings() {
  try {
    // Verificar se já existe uma configuração
    const existingSettings = await prisma.settings.findFirst()

    if (existingSettings) {
      console.log('✅ Configurações já existem:', existingSettings.id)

      // Verificar se os novos campos existem e atualizar se necessário
      if (!existingSettings.headerImageUrl) {
        const updated = await prisma.settings.update({
          where: { id: existingSettings.id },
          data: {
            headerImageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
            headerTitle: 'Encontre o Imóvel Perfeito',
            headerSubtitle: 'Casas, apartamentos e terrenos dos seus sonhos'
          }
        })
        console.log('✅ Configurações atualizadas com novos campos do header')
      }

      return
    }

    // Criar configurações padrão
    const settings = await prisma.settings.create({
      data: {
        siteName: 'ImobiNext',
        siteDescription: 'Encontre o imóvel dos seus sonhos',
        contactEmail: 'contato@imobinext.com',
        contactPhone: '(48) 99864-5864',
        contactWhatsapp: '5548998645864',
        address: 'Rua das Flores, 123',
        city: 'Florianópolis',
        state: 'SC',
        socialFacebook: 'https://facebook.com',
        socialInstagram: 'https://instagram.com',
        socialLinkedin: 'https://linkedin.com',
        featuredLimit: 6,
        enableRegistrations: true,
        enableComments: false,
        headerImageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        headerTitle: 'Encontre o Imóvel Perfeito',
        headerSubtitle: 'Casas, apartamentos e terrenos dos seus sonhos'
      }
    })

    console.log('✅ Configurações padrão criadas:', settings.id)
  } catch (error) {
    console.error('❌ Erro ao criar configurações:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDefaultSettings()