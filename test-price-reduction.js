const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testPriceReduction() {
  // Buscar o imóvel que tem alerta
  const alert = await prisma.priceAlert.findFirst({
    where: { active: true },
    include: { property: true }
  })
  
  if (!alert) {
    console.log('❌ Nenhum alerta ativo encontrado')
    return
  }
  
  console.log('📍 Imóvel:', alert.property.title)
  console.log('💰 Preço atual:', alert.property.price)
  console.log('💰 Preço anterior:', alert.property.previousPrice)
  console.log('🔻 Preço reduzido?:', alert.property.priceReduced)
  console.log('📅 Data redução:', alert.property.priceReducedAt)
  
  await prisma.$disconnect()
}

testPriceReduction()
