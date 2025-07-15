const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function testLogin() {
  // URL do banco de produção
  const productionUrl = 'postgres://neondb_owner:npg_2jyDtYQTe0RZ@ep-morning-art-acmxwsl8-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require'
  
  const prisma = new PrismaClient({
    datasources: {
      db: { url: productionUrl }
    }
  })

  try {
    console.log('🧪 Testando login...')
    await prisma.$connect()

    // Buscar o usuário admin
    const user = await prisma.user.findUnique({
      where: { email: 'admin@imobinext.com' }
    })

    if (!user) {
      console.log('❌ Usuário não encontrado!')
      return
    }

    console.log('✅ Usuário encontrado:')
    console.log(`📧 Email: ${user.email}`)
    console.log(`🆔 ID: ${user.id}`)
    console.log(`👤 Nome: ${user.name}`)
    console.log(`🔐 Tem senha: ${!!user.password}`)

    // Testar a senha
    if (user.password) {
      const passwordMatch = await bcrypt.compare('admin123', user.password)
      console.log(`🔑 Senha "admin123" funciona: ${passwordMatch ? '✅ SIM' : '❌ NÃO'}`)
      
      if (passwordMatch) {
        console.log('\n🎉 LOGIN DEVE FUNCIONAR!')
        console.log('📧 Email: admin@imobinext.com')
        console.log('🔑 Senha: admin123')
        console.log('🌐 URL: https://faimoveis-site.vercel.app/admin/login')
      } else {
        console.log('\n❌ SENHA NÃO BATE - Problema no hash')
      }
    } else {
      console.log('❌ Usuário não tem senha definida')
    }

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testLogin()