const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkHeaderSettings() {
  try {
    console.log('🔍 Verificando configurações do header...')

    const settings = await prisma.settings.findFirst()

    if (!settings) {
      console.log('❌ Nenhuma configuração encontrada!')
      return
    }

    console.log('✅ Configurações encontradas:')
    console.log('📸 Header Image URL:', settings.headerImageUrl)
    console.log('📝 Header Title:', settings.headerTitle)
    console.log('📄 Header Subtitle:', settings.headerSubtitle)

    // Testar se a URL da imagem é válida
    if (settings.headerImageUrl) {
      console.log('\n🧪 Testando URL da imagem...')
      try {
        const fetch = require('node-fetch')
        const response = await fetch(settings.headerImageUrl, { method: 'HEAD' })
        console.log(`📊 Status da imagem: ${response.status} ${response.statusText}`)
        console.log(`📏 Content-Type: ${response.headers.get('content-type')}`)
      } catch (error) {
        console.log('❌ Erro ao testar URL:', error.message)
      }
    }

  } catch (error) {
    console.error('❌ Erro ao verificar configurações:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkHeaderSettings()