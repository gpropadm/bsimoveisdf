const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const property = await prisma.property.findFirst({
    where: { type: 'aluguel' },
    select: {
      title: true,
      type: true,
      category: true,
      city: true,
      state: true,
      slug: true
    }
  })
  
  if (property) {
    console.log('Imóvel de aluguel encontrado:')
    console.log(JSON.stringify(property, null, 2))
    
    const categorySlug = property.category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
    const stateSlug = property.state.toLowerCase()
    const citySlug = property.city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
    
    const url = `/imovel/${categorySlug}/${property.type}/${stateSlug}/${citySlug}/${property.slug}`
    console.log('\nURL gerada:')
    console.log(url)
  } else {
    console.log('Nenhum imóvel de aluguel encontrado no banco')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
