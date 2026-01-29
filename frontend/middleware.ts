import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const adminToken = request.cookies.get('admin_token');
    const storeToken = request.cookies.get('store_token');
    const { pathname } = request.nextUrl;

    // --- ADMIN CONTEXT ---
    // Protect Dashboard
    if (pathname.startsWith('/dashboard')) {
        if (!adminToken) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Redirect Logged Admin away from Login
    if (pathname === '/login' && adminToken) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // --- STORE CONTEXT ---
    // Protect Customer Routes (e.g. My Orders, Checkout)
    const protectedStoreRoutes = ['/orders/my', '/checkout'];
    if (protectedStoreRoutes.some(route => pathname.startsWith(route))) {
        if (!storeToken) {
            const loginUrl = new URL('/signin', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // Redirect Logged Customer away from Signin/Signup
    if ((pathname === '/signin' || pathname === '/signup') && storeToken) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/login', '/dashboard/:path*', '/orders/:path*', '/checkout', '/signin', '/signup'],
};
