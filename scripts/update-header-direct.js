const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateHeaderDirect() {
  try {
    console.log('🔧 Atualizando configurações do header diretamente...')

    // Verificar se existe uma configuração
    let settings = await prisma.settings.findFirst()

    if (!settings) {
      console.log('➕ Criando nova configuração...')
      settings = await prisma.settings.create({
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
          headerImageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
          headerTitle: 'Encontre o Lar dos Seus Sonhos',
          headerSubtitle: 'Ambientes aconchegantes e bem planejados esperando por você'
        }
      })
    } else {
      console.log('🔄 Atualizando configuração existente...')
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: {
          headerImageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
          headerTitle: 'Encontre o Lar dos Seus Sonhos',
          headerSubtitle: 'Ambientes aconchegantes e bem planejados esperando por você'
        }
      })
    }

    console.log('✅ Configurações atualizadas!')
    console.log('📸 Nova imagem:', settings.headerImageUrl)
    console.log('📝 Novo título:', settings.headerTitle)
    console.log('📄 Novo subtítulo:', settings.headerSubtitle)

    // Testar a API agora
    console.log('\n🧪 Testando API...')
    const fetch = require('node-fetch')

    try {
      const response = await fetch('http://localhost:3000/api/settings')
      const data = await response.json()

      console.log('📊 Resultado da API:')
      console.log('   • Header Image URL:', data.settings.headerImageUrl)
      console.log('   • Header Title:', data.settings.headerTitle)
      console.log('   • Header Subtitle:', data.settings.headerSubtitle)
    } catch (apiError) {
      console.log('❌ Erro ao testar API:', apiError.message)
    }

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateHeaderDirect()