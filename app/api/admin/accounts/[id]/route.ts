// app/api/admin/accounts/[id]/route.ts
import { NextRequest } from "next/server";
import { requireAdmin, apiSuccess, apiError } from "@/server/security/guard";
import { updateAccountStatusSchema } from "@/lib/schemas";
import { updateAccountStatus, getAccountById } from "@/server/services/account.service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if ("errorResponse" in auth) return auth.errorResponse;

  const accountId = parseInt(params.id, 10);
  if (isNaN(accountId)) {
    return apiError("INVALID_ID", "รหัสบัญชีไม่ถูกต้อง", 400);
  }

  const existing = getAccountById(accountId);
  if (!existing) {
    return apiError("NOT_FOUND", "ไม่พบบัญชีธนาคาร", 404);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const parsed = updateAccountStatusSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", parsed.error.errors[0]?.message || "ข้อมูลไม่ถูกต้อง", 400);
    }

    const updatedAccount = await updateAccountStatus(
      accountId,
      parsed.data.status,
      parsed.data.reason,
      auth.user.id
    );

    return apiSuccess({ account: updatedAccount });
  } catch (error: any) {
    return apiError("UPDATE_FAILED", error.message || "ไม่สามารถเปลี่ยนสถานะบัญชีได้", 400);
  }
}
