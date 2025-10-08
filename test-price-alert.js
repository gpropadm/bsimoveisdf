const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkAlerts() {
  const alerts = await prisma.priceAlert.findMany({
    include: {
      property: {
        select: {
          title: true,
          price: true
        }
      }
    }
  })
  
  console.log('📋 Alertas cadastrados:', alerts.length)
  alerts.forEach(alert => {
    console.log('\n---')
    console.log('Nome:', alert.name)
    console.log('Telefone:', alert.phone)
    console.log('Imóvel:', alert.property.title)
    console.log('Preço atual:', alert.property.price)
    console.log('Ativo:', alert.active)
    console.log('Criado:', alert.createdAt)
  })
  
  await prisma.$disconnect()
}

checkAlerts()
