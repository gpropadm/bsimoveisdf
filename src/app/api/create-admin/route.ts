import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST() {
  try {
    // Verificar se já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@imobinext.com' }
    })

    if (existingUser) {
      return NextResponse.json({ 
        success: true, 
        message: 'Usuário admin já existe',
        user: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name
        }
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
      error: String(error) 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}