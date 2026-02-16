import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all routes starting with /admin
  if (pathname.startsWith('/admin')) {
    const adminKey = request.cookies.get('vlk_admin_key')?.value;

    // We check the cookie against the secret key set in Vercel.
    // If you haven't set the Vercel variable yet, it defaults to 'authenticated'
    if (adminKey !== (process.env.ADMIN_PASSPHRASE || 'authenticated')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};