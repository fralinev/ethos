import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const ua = req.headers.get('user-agent') || ''
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua)
  if (isMobile) {
    return NextResponse.redirect(new URL('/desktop-only', req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!desktop-only|_next|favicon.ico).*)'],
}
