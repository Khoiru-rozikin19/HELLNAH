import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Protect /admin/dashboard, /admin/editweb, /admin/edit_transfer, /admin/edit_users
  // But allow /admin (login page) and /api/auth/login
  const protectedPaths = ['/admin/dashboard', '/admin/editweb', '/admin/edit_transfer', '/admin/edit_users'];
  const protectedApiPaths = ['/api/admin/'];

  const isProtectedPage = protectedPaths.some(p => pathname.startsWith(p));
  const isProtectedApi = protectedApiPaths.some(p => pathname.startsWith(p));

  if (isProtectedPage || isProtectedApi) {
    const token = request.cookies.get('helix_session')?.value;

    if (!token) {
      if (isProtectedApi) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      // Redirect to login
      const loginUrl = new URL('/admin', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Token exists - basic check (full JWT verification happens in API routes)
    // We just check the cookie presence here for page navigation
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path+', '/api/admin/:path*'],
};
