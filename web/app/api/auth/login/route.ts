import { NextResponse } from 'next/server';
import * as jwt from 'jsonwebtoken';

// Constants for authentication
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-this';
const TOKEN_EXPIRY = 60 * 60 * 24 * 7; // 7 days

/**
 * Verify if the provided password matches the admin password
 */
function verifyPassword(password: string): boolean {
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
 */
function createToken(): string {
  const payload = {
    authenticated: true,
    exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRY
  };
  
  return jwt.sign(payload, JWT_SECRET);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { message: 'Password is required' }, 
        { status: 400 }
      );
    }

    const isValid = verifyPassword(password);
    
    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid password' }, 
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = createToken();

    return NextResponse.json(
      { token, message: 'Authentication successful' }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred' }, 
      { status: 500 }
    );
  }
} 