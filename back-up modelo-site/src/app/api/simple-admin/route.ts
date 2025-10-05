import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    // Usar exatamente a mesma estratégia que funcionou no test-db
    const originalUrl = process.env.DATABASE_URL
    let convertedUrl = originalUrl
    if (originalUrl?.startsWith('postgres://')) {
      convertedUrl = originalUrl.replace('postgres://', 'postgresql://')
    }
    
    const prisma = new PrismaClient({
      datasources: {
        db: { url: convertedUrl }
      }
    })
    
    await prisma.$connect()
    
    // Primeiro, listar todos os usuários
    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true, name: true }
    })
    
    // Procurar o admin
    const admin = allUsers.find(user => user.email === 'admin@imobinext.com')
    
    if (admin) {
      // Atualizar senha do admin existente
      const hashedPassword = await bcrypt.hash('admin123', 12)
      
      await prisma.user.update({
        where: { id: admin.id },
        data: { password: hashedPassword }
      })
      
      await prisma.$disconnect()
      
      return NextResponse.json({
        success: true,
        message: 'Admin encontrado e senha atualizada!',
        admin: admin,
        allUsers: allUsers.length,
        credentials: {
          email: 'admin@imobinext.com',
          password: 'admin123'
        }
      })
    } else {
      // Criar novo admin
      const hashedPassword = await bcrypt.hash('admin123', 12)
      
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@imobinext.com',
          password: hashedPassword,
          name: 'Administrador',
          role: 'admin'
        }
      })
      
      await prisma.$disconnect()
      
      return NextResponse.json({
        success: true,
        message: 'Novo admin criado!',
        admin: { id: newAdmin.id, email: newAdmin.email, name: newAdmin.name },
        allUsers: allUsers.length + 1,
        credentials: {
          email: 'admin@imobinext.com',
          password: 'admin123'
        }
      })
    }
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 })
  }
}