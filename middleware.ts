import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const { pathname } = url

  // Ignore next internal paths and static files
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next()
  }

  // Handle forced locale fallback
  if (pathname.startsWith('/blog') && url.searchParams.get('forceLocale') === 'en') {
    url.searchParams.delete('forceLocale')
    const response = NextResponse.redirect(url)
    response.cookies.set('NEXT_LOCALE', 'en', { path: '/', maxAge: 60 * 60 * 24 * 365 })
    return response
  }

  if (pathname === '/es' || pathname.startsWith('/es/')) {
    url.pathname = pathname.replace(/^\/es/, '') || '/'
    const response = NextResponse.rewrite(url)
    response.cookies.set('NEXT_LOCALE', 'es', { path: '/', maxAge: 60 * 60 * 24 * 365 })
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
}
