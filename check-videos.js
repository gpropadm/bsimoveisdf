const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkVideos() {
  try {
    console.log('🔍 Verificando imóveis com vídeos...\n')

    const properties = await prisma.property.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        video: true
      }
    })

    console.log(`📊 Total de imóveis: ${properties.length}\n`)

    const withVideo = properties.filter(p => p.video)
    console.log(`🎥 Imóveis com campo video preenchido: ${withVideo.length}\n`)

    if (withVideo.length > 0) {
      console.log('Detalhes dos imóveis com vídeo:')
      console.log('─'.repeat(80))
      withVideo.forEach(p => {
        console.log(`\nID: ${p.id}`)
        console.log(`Título: ${p.title}`)
        console.log(`Slug: ${p.slug}`)
        console.log(`Vídeo: ${p.video}`)
        console.log('─'.repeat(80))
      })
    } else {
      console.log('❌ Nenhum imóvel tem vídeo cadastrado')
    }

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkVideos()
