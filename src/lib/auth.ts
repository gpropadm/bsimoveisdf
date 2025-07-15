import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Criar instância do Prisma específica para NextAuth
const createPrismaClient = () => {
  let dbUrl = process.env.DATABASE_URL_CUSTOM || process.env.DATABASE_URL || ''
  
  // Corrigir formato se necessário
  if (dbUrl.startsWith('postgres://')) {
    dbUrl = dbUrl.replace('postgres://', 'postgresql://')
  }
  
  return new PrismaClient({
    datasources: {
      db: { url: dbUrl }
    }
  })
}

const authPrisma = createPrismaClient()

export const authOptions = {
  adapter: PrismaAdapter(authPrisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await authPrisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      session.user.id = token.sub
      session.user.role = token.role
      return session
    }
  },
  pages: {
    signIn: '/admin/login',
  },
}