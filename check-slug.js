const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const property = await prisma.property.findFirst({
    where: {
      slug: 'apartamento-2-quartos-santa-maria-df-aceita-financiamento'
    },
    select: {
      slug: true,
      title: true,
      city: true,
      state: true,
      category: true,
      type: true
    }
  })
  
  console.log('Property with problematic slug:')
  console.log(JSON.stringify(property, null, 2))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
