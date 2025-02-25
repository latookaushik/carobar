// lib/jwtUtil.ts

//jwtUtil.ts, is a self-contained module responsible for the core JWT (JSON Web Token) operations 
// within application. Provides functions for creating and verifying JWTs, 
// ensuring consistent handling of tokens throughout your project.

import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// JWTPayload interface defining the structure of a JWT payload for Carobar application.
export interface JWTPayload {
  userId: string;
  userName: string;
  email: string;
  companyId: string;
  companyName: string;
  roleId: string;
  roleName: string;
}

// Read JWT_SECRET from environment variables.
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    'JWT_SECRET environment variable is not set. Please set in your environment.',
  );
}

//generate token for the payload using JWT_SECRET
export function createToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: '1d' });
}

//verify the token and return the payload if valid
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as string);
    if (typeof decoded === 'string') {
        return null;
    }
    return decoded as JWTPayload;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}
