import { PrismaClient } from '@prisma/client'

 // Configurar DATABASE_URL a partir de DATABASE_URL_POSTGRES
  if (!process.env.DATABASE_URL && process.env.DATABASE_URL_POSTGRES) {
    process.env.DATABASE_URL = process.env.DATABASE_URL_POSTGRES;
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