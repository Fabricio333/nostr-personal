import { NextResponse, type NextRequest } from 'next/server'

const LOCALES = ['en', 'es'] as const

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const firstSegment = pathname.split('/')[1]
  if (LOCALES.includes(firstSegment as any)) {
    const locale = firstSegment as typeof LOCALES[number]
    const newPath = pathname.replace(`/${locale}`, '') || '/'
    const url = request.nextUrl.clone()
    url.pathname = newPath
    const response = NextResponse.rewrite(url)
    response.cookies.set('NEXT_LOCALE', locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    })
    return response
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/|.*\..*).*)'],
}
