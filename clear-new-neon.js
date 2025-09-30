const { PrismaClient } = require('@prisma/client')

// Novo banco Neon
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_fxg7IYqy9smj@ep-tiny-paper-ac4j6ab7-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require"
    }
  }
})

async function main() {
  console.log('Conectando ao novo banco Neon...')

  // Listar imóveis
  const properties = await prisma.property.findMany()
  console.log(`\nImóveis encontrados: ${properties.length}`)
  properties.forEach(p => console.log(`- ID: ${p.id} | ${p.title}`))

  // Deletar todos
  const deleted = await prisma.property.deleteMany({})
  console.log(`\n✅ ${deleted.count} imóveis deletados`)

  // Confirmar
  const after = await prisma.property.count()
  console.log(`Imóveis restantes: ${after}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
