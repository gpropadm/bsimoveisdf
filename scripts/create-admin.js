const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@imobinext.com' }
    })

    if (existingAdmin) {
      console.log('❌ Admin já existe!')
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('ULTRAPHINK', 10)

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        name: 'Administrador',
        email: 'admin@imobinext.com',
        password: hashedPassword,
        role: 'admin'
      }
    })

    console.log('✅ Admin criado com sucesso!')
    console.log('📧 Email: admin@imobinext.com')
    console.log('🔑 Senha: ULTRAPHINK')
    console.log('🆔 ID:', admin.id)

  } catch (error) {
    console.error('❌ Erro ao criar admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()