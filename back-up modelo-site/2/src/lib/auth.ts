import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🔐 Tentativa de login:', { email: credentials?.email, hasPassword: !!credentials?.password });
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Credenciais faltando');
          return null
        }

        try {
          // Criar nova instância do Prisma para cada login
          const prisma = new PrismaClient()
          
          await prisma.$connect()
          
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          console.log('👤 Usuário encontrado:', { found: !!user, email: user?.email });

          await prisma.$disconnect()

          if (!user || !user.password) {
            console.log('❌ Usuário ou senha não encontrados');
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          console.log('🔑 Senha válida:', isPasswordValid);

          if (!isPasswordValid) {
            console.log('❌ Senha inválida');
            return null
          }

          console.log('✅ Login bem-sucedido');
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error('❌ Auth error:', error)
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