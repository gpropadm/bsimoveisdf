import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
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
          message: 'Usuário admin existe - senha atualizada',
          credentials: {
            email: 'admin@imobinext.com',
            password: 'admin123'
          }
        })
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Usuário admin já existe e está funcionando',
        credentials: {
          email: 'admin@imobinext.com',
          password: 'admin123'
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
      error: String(error) 
    }, { status: 500 })
  }
}