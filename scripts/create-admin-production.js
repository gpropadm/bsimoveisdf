const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    // Verificar se já existe um usuário admin
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@imobinext.com' }
    })

    if (existingAdmin) {
      console.log('✅ Usuário admin já existe!')
      console.log('📧 Email:', existingAdmin.email)
      console.log('🆔 ID:', existingAdmin.id)
      return
    }

    // Criar hash da senha
    const hashedPassword = await bcrypt.hash('admin123', 12)

    // Criar o usuário admin
    const admin = await prisma.user.create({
      data: {
        email: 'admin@imobinext.com',
        password: hashedPassword,
        name: 'Administrador',
        role: 'admin'
      }
    })

    console.log('✅ Admin criado com sucesso!')
    console.log('📧 Email: admin@imobinext.com')
    console.log('🔑 Senha: admin123')
    console.log('🆔 ID:', admin.id)

  } catch (error) {
    console.error('❌ Erro ao criar admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()