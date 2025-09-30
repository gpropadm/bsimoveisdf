const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const deleted = await prisma.property.deleteMany({})
  console.log(`${deleted.count} imóveis deletados`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
