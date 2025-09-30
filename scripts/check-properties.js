const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkProperties() {
  try {
    console.log('🔍 Verificando imóveis no banco atual...')

    const properties = await prisma.property.findMany({
      select: {
        id: true,
        title: true,
        type: true,
        price: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`📊 Total de imóveis encontrados: ${properties.length}`)

    if (properties.length > 0) {
      console.log('\n📋 Lista de imóveis:')
      properties.forEach((prop, index) => {
        console.log(`${index + 1}. ${prop.title} - ${prop.type} - R$ ${prop.price}`)
      })
    } else {
      console.log('⚠️  Nenhum imóvel encontrado no banco!')
      console.log('🔄 Vou verificar se existe backup...')
    }

  } catch (error) {
    console.error('❌ Erro ao verificar imóveis:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProperties()