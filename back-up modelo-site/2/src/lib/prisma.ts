import { PrismaClient } from '@prisma/client'

// Configurar DATABASE_URL usando POSTGRES_URL da Vercel/Neon
if (process.env.POSTGRES_URL) {
  // Converter postgres:// para postgresql:// se necessário
  process.env.DATABASE_URL = process.env.POSTGRES_URL.replace('postgres://', 'postgresql://');
  
  // Adicionar channel_binding=require se não estiver presente
  if (!process.env.DATABASE_URL.includes('channel_binding=require')) {
    process.env.DATABASE_URL += '&channel_binding=require';
  }
}

// Log para debug (apenas em desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  console.log('DATABASE_URL configurada:', process.env.DATABASE_URL?.substring(0, 50) + '...');
}

declare global {
  var prisma: PrismaClient | undefined
}

const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma
}

export { prisma }
export default prisma