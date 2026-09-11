// app/api/deposits/route.ts
import { NextRequest } from "next/server";
import { requireAuth, apiSuccess, apiError, verifyAccountOwnership, checkRateLimit } from "@/server/security/guard";
import { depositSchema } from "@/lib/schemas";
import { processDeposit } from "@/server/services/transaction.service";

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if ("errorResponse" in auth) return auth.errorResponse;

  const rate = checkRateLimit(`deposit_${auth.user.id}`, 15, 60);
  if (!rate.allowed) {
    return apiError("RATE_LIMITED", "ทำรายการฝากเงินบ่อยเกินไป กรุณารอสักครู่", 429);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const parsed = depositSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", parsed.error.errors[0]?.message || "ข้อมูลไม่ถูกต้อง", 400);
    }

    const { account_id, amount, description } = parsed.data;

    // Member can only deposit to their own account; Admin can deposit to any
    if (!verifyAccountOwnership(auth.user, account_id)) {
      return apiError("FORBIDDEN", "คุณไม่มีสิทธิ์ฝากเงินเข้าบัญชีนี้", 403);
    }

    const tx = await processDeposit({
      accountId: account_id,
      amount,
      description,
      actorId: auth.user.id,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      userAgent: req.headers.get("user-agent") || "Web/Client",
    });

    return apiSuccess({ transaction: tx }, 201);
  } catch (error: any) {
    console.error("Deposit error:", error);
    const msg = error.message || "ไม่สามารถทำรายการฝากเงินได้";
    return apiError("DEPOSIT_FAILED", msg, 400);
  }
}
