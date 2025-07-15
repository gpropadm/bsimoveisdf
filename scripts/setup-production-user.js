const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

// Usar a DATABASE_URL do PostgreSQL
const prisma = new PrismaClient()

async function setupProductionUser() {
  try {
    console.log('🔍 Verificando conexão com banco de produção...')
    
    // Testar conexão
    await prisma.$connect()
    console.log('✅ Conectado ao banco de produção!')
    
    // Verificar se usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@imobinext.com' }
    })

    if (existingUser) {
      console.log('✅ Usuário admin já existe no banco de produção!')
      console.log('📧 Email:', existingUser.email)
      console.log('🆔 ID:', existingUser.id)
      
      // Testar senha
      const passwordWorks = await bcrypt.compare('admin123', existingUser.password)
      console.log('🔑 Senha funciona:', passwordWorks)
      
      if (!passwordWorks) {
        console.log('🔧 Atualizando senha...')
        const newPassword = await bcrypt.hash('admin123', 12)
        await prisma.user.update({
          where: { email: 'admin@imobinext.com' },
          data: { password: newPassword }
        })
        console.log('✅ Senha atualizada!')
      }
    } else {
      console.log('➕ Criando usuário admin no banco de produção...')
      
      const hashedPassword = await bcrypt.hash('admin123', 12)
      
      const newUser = await prisma.user.create({
        data: {
          email: 'admin@imobinext.com',
          password: hashedPassword,
          name: 'Administrador',
          role: 'admin'
        }
      })
      
      console.log('✅ Usuário admin criado com sucesso!')
      console.log('📧 Email: admin@imobinext.com')
      console.log('🔑 Senha: admin123')
      console.log('🆔 ID:', newUser.id)
    }
    
  } catch (error) {
    console.error('❌ Erro:', error)
    
    if (error.code === 'P1001') {
      console.error('💡 Erro de conexão: Verifique se as variáveis de ambiente estão corretas na Vercel')
    }
  } finally {
    await prisma.$disconnect()
  }
}

setupProductionUser()