import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const { locale } = await req.json()
  if (locale !== 'en' && locale !== 'es') {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  cookies().set('NEXT_LOCALE', locale, { path: '/', maxAge: 31536000 })
  return NextResponse.json({ ok: true })
}
