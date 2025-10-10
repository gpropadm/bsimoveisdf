const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const email = 'bsimoveisdf@gmail.com'
  const password = '1010'
  const hashedPassword = await bcrypt.hash(password, 10)

  // Verificar se já existe
  const existing = await prisma.user.findUnique({
    where: { email }
  })

  if (existing) {
    console.log('❌ Usuário já existe!')
    return
  }

  // Criar usuário admin
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: 'BS Imóveis DF',
      role: 'admin'
    }
  })

  console.log('✅ Usuário admin criado com sucesso!')
  console.log(`Email: ${user.email}`)
  console.log(`Senha: 1010`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
