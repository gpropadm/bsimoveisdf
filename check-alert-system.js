const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkAlertSystem() {
  console.log('🔍 Diagnóstico do Sistema de Alertas\n')
  
  // 1. Verificar alertas ativos
  const alerts = await prisma.priceAlert.findMany({
    where: { active: true },
    include: {
      property: {
        select: {
          id: true,
          title: true,
          price: true,
          previousPrice: true,
          priceReduced: true,
          priceReducedAt: true
        }
      }
    }
  })
  
  console.log(`📋 Total de alertas ativos: ${alerts.length}\n`)
  
  if (alerts.length === 0) {
    console.log('❌ Nenhum alerta ativo encontrado!')
    await prisma.$disconnect()
    return
  }
  
  alerts.forEach((alert, index) => {
    console.log(`Alerta #${index + 1}:`)
    console.log(`  Nome: ${alert.name}`)
    console.log(`  Telefone: ${alert.phone}`)
    console.log(`  Property ID: ${alert.propertyId}`)
    console.log(`  Imóvel: ${alert.property.title}`)
    console.log(`  Preço atual: R$ ${alert.property.price}`)
    console.log(`  Preço anterior: R$ ${alert.property.previousPrice || 'null'}`)
    console.log(`  Teve redução? ${alert.property.priceReduced}`)
    console.log(`  Data da redução: ${alert.property.priceReducedAt || 'null'}`)
    console.log('')
  })
  
  // 2. Simular o que acontece quando você edita
  const testAlert = alerts[0]
  const propertyId = testAlert.propertyId
  const currentPrice = testAlert.property.price
  const testNewPrice = currentPrice - 10000 // Simular redução de 10k
  
  console.log('🧪 SIMULAÇÃO:')
  console.log(`  Se você mudar o preço de R$ ${currentPrice} para R$ ${testNewPrice}:`)
  console.log(`  - currentPrice: ${currentPrice} (tipo: ${typeof currentPrice})`)
  console.log(`  - newPrice: ${testNewPrice} (tipo: ${typeof testNewPrice})`)
  console.log(`  - testNewPrice < currentPrice: ${testNewPrice < currentPrice}`)
  console.log(`  - isPriceReduction: ${testNewPrice < currentPrice}`)
  console.log(`  - Deve enviar alerta: ${testNewPrice < currentPrice ? 'SIM ✅' : 'NÃO ❌'}`)
  
  await prisma.$disconnect()
}

checkAlertSystem().catch(console.error)
