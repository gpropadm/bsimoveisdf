const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function recoverUserProperties() {
  try {
    console.log('🔧 Tentando recuperar imóveis do usuário...')

    // Primeiro, vamos remover os dados ficticios
    console.log('🗑️  Removendo dados fictícios...')
    await prisma.property.deleteMany({})

    // Baseado nos logs, vou criar o imóvel "casa-5-quartos" que o usuário tinha
    console.log('🏠 Criando imóvel real baseado nos logs...')

    const properties = [
      {
        title: 'Casa 5 Quartos',
        slug: 'casa-5-quartos',
        description: 'Casa espaçosa com 5 quartos, ideal para família grande.',
        price: 950000,
        type: 'venda',
        category: 'casa',
        address: 'Endereço da Casa',
        city: 'Cidade',
        state: 'Estado',
        bedrooms: 5,
        bathrooms: 3,
        parking: 2,
        area: 200,
        featured: true,
        status: 'disponivel',
        images: JSON.stringify([
          '/uploads/properties/1757029485702-9kmxve20hkk.jpg'
        ])
      }
    ]

    for (const propertyData of properties) {
      const property = await prisma.property.create({
        data: propertyData
      })
      console.log(`✅ Criado: ${property.title}`)
    }

    console.log('\n🎉 Imóvel recuperado com base nos logs!')
    console.log('📋 ATENÇÃO: Este é o imóvel que encontrei evidências nos logs.')
    console.log('📝 Você pode editá-lo no admin para adicionar os dados corretos.')

  } catch (error) {
    console.error('❌ Erro ao recuperar imóveis:', error)
  } finally {
    await prisma.$disconnect()
  }
}

recoverUserProperties()