// server/auth/session.ts
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { getFallbackState } from "../db/fallback-engine";
import { DbUser, UserRole } from "../db/types";

export const SESSION_COOKIE_NAME = "apex_bank_session";
const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || "apex_super_secure_auth_secret_token_change_in_production_2026_xyz"
);

export interface SessionPayload {
  userId: number;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, 10);
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(SECRET_KEY, token);
    return {
      userId: Number(payload.userId),
      email: String(payload.email),
      role: payload.role as UserRole,
      firstName: String(payload.firstName),
      lastName: String(payload.lastName),
    };
  } catch {
    return null;
  }
}

export async function getCurrentSessionUser(): Promise<DbUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload) return null;

    // Load user record and ensure active
    const state = getFallbackState();
    const user = state.users.find((u) => u.id === payload.userId);
    if (!user || user.status !== "ACTIVE") {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}
