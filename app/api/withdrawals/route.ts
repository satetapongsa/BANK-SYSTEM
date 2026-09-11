// app/api/withdrawals/route.ts
import { NextRequest } from "next/server";
import { requireAuth, apiSuccess, apiError, verifyAccountOwnership, checkRateLimit } from "@/server/security/guard";
import { withdrawSchema } from "@/lib/schemas";
import { processWithdraw } from "@/server/services/transaction.service";

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if ("errorResponse" in auth) return auth.errorResponse;

  const rate = checkRateLimit(`withdraw_${auth.user.id}`, 10, 60);
  if (!rate.allowed) {
    return apiError("RATE_LIMITED", "ทำรายการถอนเงินบ่อยเกินไป กรุณารอสักครู่", 429);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const parsed = withdrawSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", parsed.error.errors[0]?.message || "ข้อมูลไม่ถูกต้อง", 400);
    }

    const { account_id, amount, description } = parsed.data;

    // Member can only withdraw from their own account
    if (!verifyAccountOwnership(auth.user, account_id)) {
      return apiError("FORBIDDEN", "คุณไม่มีสิทธิ์ถอนเงินจากบัญชีนี้", 403);
    }

    const tx = await processWithdraw({
      accountId: account_id,
      amount,
      description,
      actorId: auth.user.id,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      userAgent: req.headers.get("user-agent") || "Web/Client",
    });

    return apiSuccess({ transaction: tx }, 201);
  } catch (error: any) {
    console.error("Withdraw error:", error);
    const msg = error.message || "ไม่สามารถทำรายการถอนเงินได้";
    return apiError("WITHDRAW_FAILED", msg, 400);
  }
}
