const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function resetAdminPassword() {
  try {
    // Check if admin exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@imobinext.com' }
    })

    if (!existingAdmin) {
      console.log('❌ Admin não encontrado!')
      console.log('🔧 Execute: node scripts/create-admin.js para criar um novo admin')
      return
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash('admin123', 10)

    // Update admin password
    await prisma.user.update({
      where: { email: 'admin@imobinext.com' },
      data: {
        password: hashedPassword
      }
    })

    console.log('✅ Senha do admin resetada com sucesso!')
    console.log('📧 Email: admin@imobinext.com')
    console.log('🔑 Nova senha: admin123')
    console.log('🔓 Agora você pode fazer login novamente')

  } catch (error) {
    console.error('❌ Erro ao resetar senha:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetAdminPassword()