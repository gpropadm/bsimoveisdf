const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testAdminPassword() {
  try {
    // Buscar o usuário admin
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@imobinext.com' }
    })

    if (!admin) {
      console.log('❌ Usuário admin não encontrado')
      return
    }

    console.log('✅ Usuário encontrado:')
    console.log('📧 Email:', admin.email)
    console.log('🆔 ID:', admin.id)
    console.log('👤 Nome:', admin.name)
    console.log('🔐 Tem senha:', !!admin.password)
    
    if (admin.password) {
      // Testar a senha
      const passwordTest = await bcrypt.compare('admin123', admin.password)
      console.log('🔑 Senha "admin123" funciona:', passwordTest)
      
      if (!passwordTest) {
        console.log('🔧 Atualizando senha...')
        const newHashedPassword = await bcrypt.hash('admin123', 12)
        
        await prisma.user.update({
          where: { email: 'admin@imobinext.com' },
          data: { password: newHashedPassword }
        })
        
        console.log('✅ Senha atualizada com sucesso!')
      }
    }

  } catch (error) {
    console.error('❌ Erro ao testar senha:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAdminPassword()