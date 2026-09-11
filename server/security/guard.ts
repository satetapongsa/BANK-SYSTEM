// server/security/guard.ts
import { NextResponse } from "next/server";
import { getCurrentSessionUser } from "../auth/session";
import { DbUser } from "../db/types";
import { getFallbackState } from "../db/fallback-engine";

// In-memory sliding rate limiter store
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  limit: number = 20,
  windowSeconds: number = 60
): { allowed: boolean; remaining: number; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count };
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(code: string, message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      error: { code, message },
    },
    { status }
  );
}

export async function requireAuth(): Promise<
  { user: DbUser } | { errorResponse: NextResponse }
> {
  const user = await getCurrentSessionUser();
  if (!user) {
    return {
      errorResponse: apiError("UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนทำรายการ", 401),
    };
  }
  if (user.status !== "ACTIVE") {
    return {
      errorResponse: apiError("USER_SUSPENDED", "บัญชีผู้ใช้ถูกระงับการใช้งานชั่วคราว", 403),
    };
  }
  return { user };
}

export async function requireAdmin(): Promise<
  { user: DbUser } | { errorResponse: NextResponse }
> {
  const authResult = await requireAuth();
  if ("errorResponse" in authResult) return authResult;

  if (authResult.user.role !== "ADMIN") {
    return {
      errorResponse: apiError("FORBIDDEN", "คุณไม่มีสิทธิ์ผู้ดูแลระบบ (Admin) ในการเข้าถึงส่วนนี้", 403),
    };
  }

  return { user: authResult.user };
}

export function verifyAccountOwnership(user: DbUser, accountId: number): boolean {
  if (user.role === "ADMIN") return true;
  const state = getFallbackState();
  const account = state.bank_accounts.find((a) => a.id === accountId);
  return account?.user_id === user.id;
}
