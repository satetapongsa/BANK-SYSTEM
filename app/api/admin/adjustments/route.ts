// app/api/admin/adjustments/route.ts
import { NextRequest } from "next/server";
import { requireAdmin, apiSuccess, apiError } from "@/server/security/guard";
import { adminAdjustmentSchema } from "@/lib/schemas";
import { processAdminAdjustment } from "@/server/services/transaction.service";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ("errorResponse" in auth) return auth.errorResponse;

  try {
    const body = await req.json().catch(() => ({}));
    const parsed = adminAdjustmentSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", parsed.error.errors[0]?.message || "ข้อมูลไม่ถูกต้อง", 400);
    }

    const { account_id, type, amount, reason } = parsed.data;

    const tx = await processAdminAdjustment({
      accountId: account_id,
      type,
      amount,
      reason,
      actorId: auth.user.id,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      userAgent: req.headers.get("user-agent") || "Admin/Console",
    });

    return apiSuccess({ transaction: tx }, 201);
  } catch (error: any) {
    console.error("Adjustment error:", error);
    const msg = error.message || "ไม่สามารถปรับปรุงยอดเงินได้";
    return apiError("ADJUSTMENT_FAILED", msg, 400);
  }
}
