const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const properties = await prisma.property.findMany({
    select: {
      title: true,
      city: true,
      state: true,
      category: true
    },
    take: 5
  })
  
  console.log('Properties with cities:')
  properties.forEach(p => {
    console.log(`- ${p.title}`)
    console.log(`  Cidade: ${p.city}, Estado: ${p.state}, Categoria: ${p.category}`)
    console.log()
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
