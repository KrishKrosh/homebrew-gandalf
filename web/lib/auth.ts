import * as jwt from 'jsonwebtoken';
import { setCookie, getCookie, deleteCookie } from 'cookies-next';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-this';
const TOKEN_COOKIE_NAME = 'gandalf-auth-token';
const TOKEN_EXPIRY = 60 * 60 * 24 * 7; // 7 days

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
  } catch {
    // Ignore the error details, just return null on any verification failure
    return null;
  }
}

/**
 * Client-side functions for auth cookies
 */

// Set auth cookie in the browser
export function setClientAuthCookie(token: string): void {
  setCookie(TOKEN_COOKIE_NAME, token, {
    maxAge: TOKEN_EXPIRY,
    path: '/',
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });
}

// Get auth cookie from the browser
export function getClientAuthCookie(): string | null {
  return getCookie(TOKEN_COOKIE_NAME)?.toString() || null;
}

// Clear auth cookie in the browser
export function clearClientAuthCookie(): void {
  deleteCookie(TOKEN_COOKIE_NAME);
}

// Check auth status on the client
export function getClientAuthStatus(): boolean {
  const token = getClientAuthCookie();
  if (!token) return false;
  
  const payload = verifyToken(token);
  return !!payload?.authenticated;
} 