import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const debug = {
      nextauth_url: process.env.NEXTAUTH_URL || 'NOT_SET',
      nextauth_secret: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT_SET',
      database_url: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
      database_provider: process.env.DATABASE_URL?.startsWith('postgresql') ? 'postgresql' : 'other',
      database_url_preview: process.env.DATABASE_URL?.substring(0, 30) + '...',
      node_env: process.env.NODE_ENV,
      site_url: process.env.SITE_URL || 'NOT_SET',
      site_name: process.env.SITE_NAME || 'NOT_SET'
    }
    
    return NextResponse.json(debug)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}