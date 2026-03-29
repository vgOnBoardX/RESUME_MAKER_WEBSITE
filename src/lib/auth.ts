import { SignJWT, jwtVerify } from "jose";
import { getJwtSecretKeyBytes } from "@/lib/jwt-secret";

/** HttpOnly cookie storing the JWT (browser). */
export const AUTH_COOKIE = "resume_maker_session";

const DEFAULT_EXPIRY = "7d";

/**
 * Create a signed JWT (HS256) with subject = userId and email claim.
 * Secret comes from JWT_SECRET / AUTH_SECRET, or Google Cloud Secret Manager (see jwt-secret.ts).
 */
export async function signAccessToken(userId: string, email: string): Promise<string> {
  const key = await getJwtSecretKeyBytes();
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(DEFAULT_EXPIRY)
    .sign(key);
}

export type JwtPayload = {
  userId: string;
  email: string;
};

/**
 * Verify JWT signature and expiry. Returns null if invalid or expired.
 */
export async function verifyAccessToken(token: string | undefined): Promise<JwtPayload | null> {
  if (!token?.trim()) return null;
  try {
    const key = await getJwtSecretKeyBytes();
    const { payload } = await jwtVerify(token, key);
    const userId = typeof payload.sub === "string" ? payload.sub : null;
    if (!userId) return null;
    const email = typeof payload.email === "string" ? payload.email : "";
    return { userId, email };
  } catch {
    return null;
  }
}

/** Read Bearer token from Authorization header (API / mobile clients). */
export function getBearerToken(request: Request): string | undefined {
  const auth = request.headers.get("authorization");
  if (!auth?.toLowerCase().startsWith("bearer ")) return undefined;
  return auth.slice(7).trim() || undefined;
}
