import jwt from "jsonwebtoken";
import { jwtVerify, SignJWT } from "jose";
import { serialize, parse } from "cookie";
import type { NextApiResponse } from "next";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const TOKEN_NAME = "koneksi_karir_token";

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Generate JWT token with expiration at midnight (00:00)
 * Uses jsonwebtoken (Node.js crypto) - works in API routes
 */
export function generateToken(payload: JWTPayload): string {
  // Calculate expiration at midnight (00:00) of the next day
  const now = new Date();
  const midnight = new Date(now);
  midnight.setDate(midnight.getDate() + 1);
  midnight.setHours(0, 0, 0, 0);

  const expiresIn = Math.floor((midnight.getTime() - now.getTime()) / 1000);

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn,
  });
}

/**
 * Verify JWT token and return payload (Node.js version)
 * Use this in API routes (NOT in middleware)
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    console.log(
      "🔐 [verifyToken] Verifying token with JWT_SECRET:",
      JWT_SECRET ? "SET" : "NOT SET"
    );
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    console.log("✅ [verifyToken] Token valid, decoded:", decoded);
    return decoded;
  } catch (error) {
    console.error("❌ [verifyToken] Token verification failed:", error);
    return null;
  }
}

/**
 * Verify JWT token using jose library (Edge Runtime compatible)
 * Use this in middleware and other Edge Runtime contexts
 */
export async function verifyTokenEdge(
  token: string
): Promise<JWTPayload | null> {
  try {
    console.log(
      "🔐 [verifyTokenEdge] Verifying token with JWT_SECRET:",
      JWT_SECRET ? "SET" : "NOT SET"
    );

    // Convert string secret to Uint8Array for jose
    const secret = new TextEncoder().encode(JWT_SECRET);

    // Verify the token
    const { payload } = await jwtVerify(token, secret);

    console.log("✅ [verifyTokenEdge] Token valid, decoded:", payload);

    // Return the payload with proper typing
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as string,
    };
  } catch (error) {
    console.error("❌ [verifyTokenEdge] Token verification failed:", error);
    return null;
  }
}

/**
 * Set JWT token in HTTP-only cookie
 */
export function setTokenCookie(res: NextApiResponse, token: string) {
  // Calculate expiration at midnight (00:00) of the next day
  const now = new Date();
  const midnight = new Date(now);
  midnight.setDate(midnight.getDate() + 1);
  midnight.setHours(0, 0, 0, 0);

  const cookie = serialize(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: midnight,
  });

  res.setHeader("Set-Cookie", cookie);
}

/**
 * Remove JWT token cookie (logout)
 */
export function removeTokenCookie(res: NextApiResponse) {
  const cookie = serialize(TOKEN_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: -1,
  });

  res.setHeader("Set-Cookie", cookie);
}

/**
 * Get token from cookie string
 */
export function getTokenFromCookie(cookieHeader?: string): string | null {
  if (!cookieHeader) return null;

  const cookies = parse(cookieHeader);
  return cookies[TOKEN_NAME] || null;
}

/**
 * Get token from Next.js cookies (App Router)
 */
export function getTokenFromNextCookies(cookies: any): string | null {
  return cookies.get(TOKEN_NAME)?.value || null;
}

/**
 * Verify token and return payload from cookie
 */
export function verifyTokenFromCookie(
  cookieHeader?: string
): JWTPayload | null {
  const token = getTokenFromCookie(cookieHeader);
  if (!token) return null;
  return verifyToken(token);
}
