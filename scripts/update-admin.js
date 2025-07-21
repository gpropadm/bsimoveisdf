const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function updateAdmin() {
  try {
    // Pegar argumentos da linha de comando
    const args = process.argv.slice(2)
    
    let email = 'admin@imobinext.com'
    let password = 'ULTRAPHINK'
    let name = 'Administrador'
    
    // Processar argumentos
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--email' && args[i + 1]) {
        email = args[i + 1]
        i++
      } else if (args[i] === '--password' && args[i + 1]) {
        password = args[i + 1]
        i++
      } else if (args[i] === '--name' && args[i + 1]) {
        name = args[i + 1]
        i++
      }
    }
    
    console.log('🔄 Atualizando credenciais do admin...')
    console.log('📧 Email:', email)
    console.log('👤 Nome:', name)
    console.log('🔑 Senha: [OCULTA]')
    
    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Verificar se admin existe
    const existingAdmin = await prisma.user.findUnique({
      where: { email: email }
    })
    
    if (existingAdmin) {
      // Atualizar admin existente
      const updatedAdmin = await prisma.user.update({
        where: { email: email },
        data: {
          name: name,
          password: hashedPassword,
          role: 'admin'
        }
      })
      
      console.log('✅ Admin atualizado com sucesso!')
      console.log('🆔 ID:', updatedAdmin.id)
      
    } else {
      // Criar novo admin
      const newAdmin = await prisma.user.create({
        data: {
          name: name,
          email: email,
          password: hashedPassword,
          role: 'admin'
        }
      })
      
      console.log('✅ Admin criado com sucesso!')
      console.log('🆔 ID:', newAdmin.id)
    }
    
    // Testar a nova senha
    const testUser = await prisma.user.findUnique({
      where: { email: email }
    })
    
    const isValid = await bcrypt.compare(password, testUser.password)
    
    if (isValid) {
      console.log('✅ Senha testada e confirmada!')
    } else {
      console.log('❌ Erro: Senha não foi salva corretamente!')
    }
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Mostrar ajuda se solicitado
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
📝 Como usar o script de atualização do admin:

node scripts/update-admin.js [opções]

Opções:
  --email <email>       Email do admin (padrão: admin@imobinext.com)
  --password <senha>    Senha do admin (padrão: ULTRAPHINK)
  --name <nome>         Nome do admin (padrão: Administrador)
  --help, -h           Mostrar esta ajuda

Exemplos:
  node scripts/update-admin.js
  node scripts/update-admin.js --email admin@faimoveis.com.br --password MinhaNovaSenh@123
  node scripts/update-admin.js --password NovaSenh@456 --name "João Silva"
`)
  process.exit(0)
}

updateAdmin()