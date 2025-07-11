const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

function generateSlug(title, city, state, type) {
  return [type, title, city, state]
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

async function main() {
  const properties = await prisma.property.findMany()
  
  for (const property of properties) {
    const slug = generateSlug(property.title, property.city, property.state, property.type)
    console.log(`Updating property ${property.id} with slug: ${slug}`)
    
    await prisma.property.update({
      where: { id: property.id },
      data: { slug }
    })
  }
  
  console.log('All slugs generated successfully!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())