import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['en', 'es'] as const

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const matched = locales.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  )
  if (!matched) return NextResponse.next()

  const locale = matched
  const path = pathname.replace(`/${locale}`, '') || '/'

  const url = request.nextUrl.clone()
  url.pathname = path

  const response = NextResponse.rewrite(url)
  response.cookies.set('NEXT_LOCALE', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })
  return response
}

export const config = {
  matcher: ['/en/:path*', '/es/:path*'],
}

