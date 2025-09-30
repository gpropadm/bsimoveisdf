import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

export async function GET() {
  let prisma: PrismaClient | null = null
  
  try {
    // Criar nova instância do Prisma com URL corrigida
    let dbUrl = process.env.DATABASE_URL_CUSTOM || process.env.DATABASE_URL || ''
    
    // Corrigir formato se necessário
    if (dbUrl.startsWith('postgres://')) {
      dbUrl = dbUrl.replace('postgres://', 'postgresql://')
    }
    
    prisma = new PrismaClient({
      datasources: {
        db: { url: dbUrl }
      }
    })
    
    await prisma.$connect()
    
    // Verificar se já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@imobinext.com' }
    })

    if (existingUser) {
      // Verificar se a senha está correta
      const passwordValid = await bcrypt.compare('admin123', existingUser.password || '')
      
      if (!passwordValid) {
        // Atualizar senha se necessário
        const hashedPassword = await bcrypt.hash('admin123', 12)
        await prisma.user.update({
          where: { email: 'admin@imobinext.com' },
          data: { password: hashedPassword }
        })
        
        return NextResponse.json({ 
          success: true, 
          message: 'Usuário admin existe - senha atualizada com sucesso!',
          credentials: {
            email: 'admin@imobinext.com',
            password: 'admin123'
          },
          action: 'PASSWORD_UPDATED'
        })
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Usuário admin já existe e a senha está correta',
        credentials: {
          email: 'admin@imobinext.com',
          password: 'admin123'
        },
        action: 'ALREADY_EXISTS'
      })
    }

    // Criar novo usuário
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const newUser = await prisma.user.create({
      data: {
        email: 'admin@imobinext.com',
        password: hashedPassword,
        name: 'Administrador',
        role: 'admin'
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Usuário admin criado com sucesso!',
      credentials: {
        email: 'admin@imobinext.com',
        password: 'admin123'
      },
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      }
    })

  } catch (error) {
    console.error('Erro ao criar admin:', error)
    return NextResponse.json({ 
      success: false, 
      error: String(error),
      dbUrl: process.env.DATABASE_URL?.substring(0, 50) + '...'
    }, { status: 500 })
  } finally {
    if (prisma) {
      await prisma.$disconnect()
    }
  }
}