const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function resetAdminPassword() {
  try {
    // Delete all existing users
    await prisma.user.deleteMany({})
    console.log('🗑️ Todos os usuários removidos')

    // Hash new password
    const hashedPassword = await bcrypt.hash('123', 10)

    // Create new admin
    await prisma.user.create({
      data: {
        email: 'fa@gmail.com',
        password: hashedPassword,
        name: 'Admin'
      }
    })

    console.log('✅ Novo admin criado com sucesso!')
    console.log('📧 Email: fa@gmail.com')
    console.log('🔑 Senha: 123')
    console.log('🔓 Agora você pode fazer login novamente')

  } catch (error) {
    console.error('❌ Erro ao resetar senha:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetAdminPassword()