const { PrismaClient } = require('@prisma/client')

async function testNeonConnection() {
  const urls = [
    'postgres://neondb_owner:npg_2jyDtYQTe0RZ@ep-morning-art-acmxwsl8-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require',
    'postgresql://neondb_owner:npg_2jyDtYQTe0RZ@ep-morning-art-acmxwsl8-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require',
    'postgresql://neondb_owner:npg_2jyDtYQTe0RZ@ep-morning-art-acmxwsl8.sa-east-1.aws.neon.tech/neondb?sslmode=require',
    'postgresql://neondb_owner:npg_2jyDtYQTe0RZ@ep-morning-art-acmxwsl8-pooler.sa-east-1.aws.neon.tech/neondb?ssl=true'
  ]

  console.log('🧪 Testando conexões com Neon...\n')

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]
    console.log(`Teste ${i + 1}: ${url.substring(0, 50)}...`)
    
    try {
      const prisma = new PrismaClient({
        datasources: {
          db: { url }
        }
      })
      
      await prisma.$connect()
      console.log('✅ Conexão bem-sucedida!')
      
      // Tentar contar usuários
      const count = await prisma.user.count()
      console.log(`📊 Usuários encontrados: ${count}`)
      
      await prisma.$disconnect()
      console.log('🎉 Esta URL funciona!\n')
      
      // Usar esta URL
      console.log(`🔧 Configure esta URL na Vercel:`)
      console.log(`DATABASE_URL=${url}`)
      
      break
      
    } catch (error) {
      console.log(`❌ Erro: ${error.message}`)
      console.log('')
    }
  }
}

testNeonConnection().catch(console.error)