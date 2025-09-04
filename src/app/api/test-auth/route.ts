import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    console.log('🧪 Testando conexão...')
    
    const prisma = new PrismaClient()
    await prisma.$connect()
    
    // Testar conexão
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Conexão OK:', result)
    
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: 'ad@gmail.com' }
    })
    
    console.log('👤 Usuário encontrado:', !!user)
    
    if (user && user.password) {
      const isValid = await bcrypt.compare('123', user.password)
      console.log('🔐 Senha válida:', isValid)
      
      await prisma.$disconnect()
      
      return NextResponse.json({
        status: 'success',
        database: 'connected',
        user: {
          found: true,
          email: user.email,
          passwordValid: isValid
        },
        env: {
          hasDbUrl: !!process.env.DATABASE_URL,
          hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
          hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
          nextAuthUrl: process.env.NEXTAUTH_URL
        }
      })
    } else {
      await prisma.$disconnect()
      return NextResponse.json({
        status: 'error',
        message: 'User not found or no password',
        env: {
          hasDbUrl: !!process.env.DATABASE_URL,
          hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
          hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
          nextAuthUrl: process.env.NEXTAUTH_URL
        }
      })
    }
    
  } catch (error: any) {
    console.error('❌ Erro:', error)
    return NextResponse.json({
      status: 'error',
      message: error.message,
      env: {
        hasDbUrl: !!process.env.DATABASE_URL,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        nextAuthUrl: process.env.NEXTAUTH_URL
      }
    }, { status: 500 })
  }
}