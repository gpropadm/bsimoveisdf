import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  // URLs para testar
  const testUrls = [
    // URL original
    'postgres://neondb_owner:npg_2jyDtYQTe0RZ@ep-morning-art-acmxwsl8-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require',
    // URL convertida
    'postgresql://neondb_owner:npg_2jyDtYQTe0RZ@ep-morning-art-acmxwsl8-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require',
    // URL sem pooler
    'postgresql://neondb_owner:npg_2jyDtYQTe0RZ@ep-morning-art-acmxwsl8.sa-east-1.aws.neon.tech/neondb?sslmode=require',
    // URL com SSL
    'postgresql://neondb_owner:npg_2jyDtYQTe0RZ@ep-morning-art-acmxwsl8-pooler.sa-east-1.aws.neon.tech/neondb?ssl=true'
  ]

  const results = []

  for (let i = 0; i < testUrls.length; i++) {
    const url = testUrls[i]
    try {
      const prisma = new PrismaClient({
        datasources: {
          db: { url }
        }
      })
      
      await prisma.$connect()
      
      // Tentar fazer uma query simples
      const userCount = await prisma.user.count()
      
      results.push({
        test: i + 1,
        url: url.substring(0, 50) + '...',
        status: 'SUCCESS',
        userCount
      })
      
      await prisma.$disconnect()
      break // Se funcionou, parar aqui
      
    } catch (error) {
      results.push({
        test: i + 1,
        url: url.substring(0, 50) + '...',
        status: 'ERROR',
        error: String(error).substring(0, 200)
      })
    }
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    results
  })
}