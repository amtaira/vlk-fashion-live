import { NextRequest, NextResponse } from 'next/server'

// The function must be named 'proxy' in Next.js 16
export function proxy(request) {
  const { pathname } = request.nextUrl;

  // Protect all routes starting with /admin
  if (pathname.startsWith('/admin')) {
    const adminKey = request.cookies.get('vlk_admin_key')?.value;

    // This checks the cookie against the secret key you set in Vercel
    if (adminKey !== process.env.ADMIN_PASSPHRASE) {
      // If the key is wrong or missing, send them to the login page
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // If everything is fine, let the request continue
  return NextResponse.next();
}

// This tells Next.js exactly which pages this code should run on
export const config = {
  matcher: ['/admin/:path*'],
};