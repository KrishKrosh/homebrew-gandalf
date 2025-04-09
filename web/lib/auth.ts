import * as jwt from 'jsonwebtoken';
import { setCookie, getCookie, deleteCookie } from 'cookies-next';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-this';
const TOKEN_COOKIE_NAME = 'gandalf-auth-token';
const TOKEN_EXPIRY = 60 * 60 * 24 * 7; // 7 days
// Check if we're in production (Vercel) or development
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export interface TokenPayload {
  authenticated: boolean;
  exp: number;
}

/**
 * Verify if the provided password matches the admin password
 * Note: This should only be used server-side in API routes
 */
export function verifyPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error('Admin password not set in environment variables');
    return false;
  }
  
  // For simplicity, we're using direct comparison
  // In a production app, you would use bcrypt.compare with hashed passwords
  return password === adminPassword;
}

/**
 * Create a JWT token for authenticated users
 * Note: This should only be used server-side in API routes
 */
export function createToken(): string {
  const payload: TokenPayload = {
    authenticated: true,
    exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRY
  };
  
  return jwt.sign(payload, JWT_SECRET);
}

/**
 * Verify the JWT token
 * Can be used in both client and server
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    // Add more detailed error logging
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Client-side functions for auth cookies
 */

// Set auth cookie in the browser
export function setClientAuthCookie(token: string): void {
  console.log('Setting auth cookie, production mode:', IS_PRODUCTION);
  
  // Use different cookie settings for production vs development
  setCookie(TOKEN_COOKIE_NAME, token, {
    maxAge: TOKEN_EXPIRY,
    path: '/',
    // In production, default to lax to allow redirects
    sameSite: IS_PRODUCTION ? 'lax' : 'strict',
    secure: IS_PRODUCTION,
    // Ensure the cookie is accessible in JavaScript
    httpOnly: false
  });
}

// Get auth cookie from the browser
export function getClientAuthCookie(): string | null {
  const cookie = getCookie(TOKEN_COOKIE_NAME)?.toString() || null;
  console.log('Retrieved auth cookie:', cookie ? 'exists' : 'not found');
  return cookie;
}

// Clear auth cookie in the browser
export function clearClientAuthCookie(): void {
  deleteCookie(TOKEN_COOKIE_NAME, {
    path: '/',
    // Match the same settings used when setting the cookie
    sameSite: IS_PRODUCTION ? 'lax' : 'strict',
    secure: IS_PRODUCTION
  });
}

// Check auth status on the client
export function getClientAuthStatus(): boolean {
  const token = getClientAuthCookie();
  if (!token) {
    console.log('No auth token found');
    return false;
  }
  
  const payload = verifyToken(token);
  const isAuthenticated = !!payload?.authenticated;
  console.log('Auth status check:', isAuthenticated ? 'authenticated' : 'not authenticated');
  return isAuthenticated;
} 