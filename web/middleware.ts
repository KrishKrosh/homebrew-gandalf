import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

// Define routes that require authentication
const PROTECTED_ROUTES = ['/dashboard'];
// Define routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = ['/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('gandalf-auth-token')?.value;
  
  // Check if the path is a protected route and the user is not authenticated
  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    if (!token) {
      // If not authenticated, redirect to login
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    try {
      // Verify token - we won't use the payload, just check if it's valid
      const JWT_SECRET = new TextEncoder().encode(
        process.env.JWT_SECRET || 'fallback-secret-key-change-this'
      );
      await jose.jwtVerify(token, JWT_SECRET);
    } catch (error) {
      // If token is invalid, redirect to login
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  // If already authenticated and trying to access login page, redirect to dashboard
  if (AUTH_ROUTES.some(route => pathname.startsWith(route)) && token) {
    try {
      const JWT_SECRET = new TextEncoder().encode(
        process.env.JWT_SECRET || 'fallback-secret-key-change-this'
      );
      await jose.jwtVerify(token, JWT_SECRET);
      
      // If token is valid, redirect to dashboard
      const dashboardUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    } catch (error) {
      // If token is invalid, let them proceed to login
    }
  }
  
  return NextResponse.next();
}

// Configure the paths that the middleware applies to
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|sounds|public).*)',
  ],
}; 