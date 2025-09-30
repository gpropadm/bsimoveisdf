import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  const results = []
  
  // Teste 1: URL original
  const originalUrl = process.env.DATABASE_URL
  results.push({
    test: 'URL Original',
    url: originalUrl?.substring(0, 50) + '...',
    format: originalUrl?.startsWith('postgres://') ? 'postgres://' : 'postgresql://'
  })

  // Teste 2: URL convertida
  let convertedUrl = originalUrl
  if (originalUrl?.startsWith('postgres://')) {
    convertedUrl = originalUrl.replace('postgres://', 'postgresql://')
  }
  
  results.push({
    test: 'URL Convertida',
    url: convertedUrl?.substring(0, 50) + '...',
    format: convertedUrl?.startsWith('postgresql://') ? 'postgresql://' : 'postgres://'
  })

  // Teste 3: Tentar conectar
  try {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: convertedUrl
        }
      }
    })
    
    await prisma.$connect()
    results.push({
      test: 'Conexão',
      status: 'SUCCESS',
      message: 'Conectado com sucesso'
    })
    
    // Teste 4: Tentar query simples
    try {
      const count = await prisma.user.count()
      results.push({
        test: 'Query Test',
        status: 'SUCCESS',
        message: `${count} usuários encontrados`
      })
    } catch (queryError) {
      results.push({
        test: 'Query Test',
        status: 'ERROR',
        message: String(queryError)
      })
    }
    
    await prisma.$disconnect()
    
  } catch (error) {
    results.push({
      test: 'Conexão',
      status: 'ERROR',
      message: String(error)
    })
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    results
  })
}