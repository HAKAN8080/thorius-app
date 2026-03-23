import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'thorius-dev-secret-CHANGE-IN-PRODUCTION'
);

// Routes that require authentication
const PROTECTED_PATHS = ['/chat', '/create', '/mentors', '/profile'];

// Admin routes
const ADMIN_PATHS = ['/admin', '/api/admin'];

// Admin email listesi (auth.ts ile senkron)
const ADMIN_EMAILS = [
  'admin@thorius.com.tr',
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  const isAdmin = ADMIN_PATHS.some((path) => pathname.startsWith(path));

  // Admin veya protected değilse geç
  if (!isProtected && !isAdmin) return NextResponse.next();

  const token = req.cookies.get('auth-token')?.value;

  if (!token) {
    if (isAdmin) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Admin rotaları için ek kontrol
    if (isAdmin) {
      const email = (payload.email as string)?.toLowerCase();
      if (!ADMIN_EMAILS.includes(email)) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 });
        }
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    return NextResponse.next();
  } catch {
    if (isAdmin && pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 });
    }
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    '/chat/:path*',
    '/create/:path*',
    '/mentors/:path*',
    '/profile/:path*',
    '/api/report',
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};
