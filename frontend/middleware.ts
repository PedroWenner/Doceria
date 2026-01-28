import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token');
    const { pathname } = request.nextUrl;

    // Se tentar acessar dashboard sem token, redireciona para login
    if (pathname.startsWith('/dashboard') && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }



    // Se já estiver logado e tentar acessar login, joga para dashboard
    if (pathname === '/login' && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/login', '/dashboard/:path*'],
};
