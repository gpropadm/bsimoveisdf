const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function recreateUserTable() {
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

    console.log('🗑️ Deletando tabela users...')
    await prisma.$executeRaw`DROP TABLE IF EXISTS "users" CASCADE;`
    console.log('✅ Tabela users deletada!')

    console.log('🗑️ Deletando tabela accounts (dependência)...')
    await prisma.$executeRaw`DROP TABLE IF EXISTS "accounts" CASCADE;`
    console.log('✅ Tabela accounts deletada!')

    console.log('🗑️ Deletando tabela sessions (dependência)...')
    await prisma.$executeRaw`DROP TABLE IF EXISTS "sessions" CASCADE;`
    console.log('✅ Tabela sessions deletada!')

    console.log('🏗️ Criando tabela users novamente...')
    await prisma.$executeRaw`
      CREATE TABLE "users" (
        "id" TEXT NOT NULL,
        "name" TEXT,
        "email" TEXT NOT NULL,
        "password" TEXT,
        "emailVerified" TIMESTAMP(3),
        "image" TEXT,
        "role" TEXT NOT NULL DEFAULT 'admin',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "users_pkey" PRIMARY KEY ("id")
      );
    `
    console.log('✅ Tabela users criada!')

    console.log('🔑 Criando índice único para email...')
    await prisma.$executeRaw`CREATE UNIQUE INDEX "users_email_key" ON "users"("email");`
    console.log('✅ Índice criado!')

    console.log('👤 Criando usuário admin...')
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    await prisma.$executeRaw`
      INSERT INTO "users" ("id", "name", "email", "password", "role", "createdAt", "updatedAt")
      VALUES (
        'admin_' || extract(epoch from now())::text,
        'Administrador',
        'admin@imobinext.com',
        ${hashedPassword},
        'admin',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      );
    `
    console.log('✅ Usuário admin criado!')

    // Verificar se foi criado
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@imobinext.com' }
    })

    if (admin) {
      console.log('🎉 Verificação bem-sucedida!')
      console.log(`📧 Email: ${admin.email}`)
      console.log(`🆔 ID: ${admin.id}`)
      console.log(`👤 Nome: ${admin.name}`)
      console.log(`🔐 Senha definida: ${!!admin.password}`)
    } else {
      console.log('❌ Erro: Admin não foi encontrado após criação')
    }

    console.log('\n🎉 Tabela users recriada com sucesso!')
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

recreateUserTable()