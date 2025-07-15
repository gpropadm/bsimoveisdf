const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function fixAdminProduction() {
  // URL do banco de produção
  const productionUrl = 'postgres://neondb_owner:npg_2jyDtYQTe0RZ@ep-morning-art-acmxwsl8-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require'
  
  const prisma = new PrismaClient({
    datasources: {
      db: { url: productionUrl }
    }
  })

  try {
    console.log('🔗 Conectando ao banco de produção...')
    await prisma.$connect()
    console.log('✅ Conectado!')

    // Listar todos os usuários
    const users = await prisma.user.findMany()
    console.log(`📊 Usuários encontrados: ${users.length}`)
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}, Email: ${user.email}, Nome: ${user.name}`)
    })

    // Procurar admin
    const admin = users.find(u => u.email === 'admin@imobinext.com')
    
    if (admin) {
      console.log('\n👤 Admin encontrado! Atualizando senha...')
      
      // Atualizar senha
      const hashedPassword = await bcrypt.hash('admin123', 12)
      
      await prisma.user.update({
        where: { id: admin.id },
        data: { 
          password: hashedPassword,
          role: 'admin',
          name: 'Administrador'
        }
      })
      
      console.log('✅ Senha do admin atualizada!')
      
    } else {
      console.log('\n➕ Admin não encontrado. Criando novo...')
      
      const hashedPassword = await bcrypt.hash('admin123', 12)
      
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@imobinext.com',
          password: hashedPassword,
          name: 'Administrador',
          role: 'admin'
        }
      })
      
      console.log(`✅ Novo admin criado! ID: ${newAdmin.id}`)
    }
    
    console.log('\n🎉 Processo concluído!')
    console.log('📧 Email: admin@imobinext.com')
    console.log('🔑 Senha: admin123')
    console.log('🌐 Login: https://faimoveis-site.vercel.app/admin/login')

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
    console.log('🔌 Desconectado do banco')
  }
}

fixAdminProduction()