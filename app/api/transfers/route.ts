// app/api/transfers/route.ts
import { NextRequest } from "next/server";
import { requireAuth, apiSuccess, apiError, verifyAccountOwnership, checkRateLimit } from "@/server/security/guard";
import { transferSchema } from "@/lib/schemas";
import { processTransfer } from "@/server/services/transaction.service";

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if ("errorResponse" in auth) return auth.errorResponse;

  const rate = checkRateLimit(`transfer_${auth.user.id}`, 10, 60);
  if (!rate.allowed) {
    return apiError("RATE_LIMITED", "ทำรายการโอนเงินบ่อยเกินไป กรุณารอสักครู่", 429);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const parsed = transferSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", parsed.error.errors[0]?.message || "ข้อมูลไม่ถูกต้อง", 400);
    }

    const { from_account_id, to_account_number, amount, description, idempotency_key } = parsed.data;

    // Verify sender ownership
    if (!verifyAccountOwnership(auth.user, from_account_id)) {
      return apiError("FORBIDDEN", "คุณไม่มีสิทธิ์โอนเงินออกจากบัญชีนี้", 403);
    }

    const tx = await processTransfer({
      fromAccountId: from_account_id,
      toAccountNumber: to_account_number,
      amount,
      description,
      actorId: auth.user.id,
      idempotencyKey: idempotency_key,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      userAgent: req.headers.get("user-agent") || "Web/Client",
    });

    return apiSuccess({ transaction: tx }, 201);
  } catch (error: any) {
    console.error("Transfer error:", error);
    const msg = error.message || "ไม่สามารถทำรายการโอนเงินได้";
    return apiError("TRANSFER_FAILED", msg, 400);
  }
}
