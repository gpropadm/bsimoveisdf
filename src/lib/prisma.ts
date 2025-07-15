import { PrismaClient } from '@prisma/client'

 // Configurar DATABASE_URL e corrigir formato postgres:// para postgresql://
  if (process.env.DATABASE_URL_CUSTOM) {
    process.env.DATABASE_URL = process.env.DATABASE_URL_CUSTOM;
  } else if (process.env.DATABASE_URL_POSTGRES) {
    process.env.DATABASE_URL = process.env.DATABASE_URL_POSTGRES;
  }
  
  // Corrigir formato postgres:// para postgresql:// se necessário
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres://')) {
    process.env.DATABASE_URL = process.env.DATABASE_URL.replace('postgres://', 'postgresql://');
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