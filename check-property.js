const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const property = await prisma.property.findFirst({
    select: {
      slug: true,
      title: true,
      city: true,
      state: true,
      category: true,
      type: true
    }
  })
  
  console.log('Property example:')
  console.log(JSON.stringify(property, null, 2))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
