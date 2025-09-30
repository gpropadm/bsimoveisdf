const { PrismaClient } = require('@prisma/client')

// Conectar direto no banco da Vercel (Neon)
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_gdShyCiQ2K3q@ep-tiny-forest-acaq0b91-pooler.sa-east-1.aws.neon.tech/neondb"
    }
  }
})

async function main() {
  console.log('Conectando ao banco Neon da Vercel...')

  // Listar imóveis antes
  const before = await prisma.property.findMany()
  console.log(`Imóveis encontrados: ${before.length}`)
  before.forEach(p => console.log(`- ${p.title}`))

  // Deletar todos
  const deleted = await prisma.property.deleteMany({})
  console.log(`\n${deleted.count} imóveis deletados`)

  // Confirmar
  const after = await prisma.property.count()
  console.log(`Imóveis restantes: ${after}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
