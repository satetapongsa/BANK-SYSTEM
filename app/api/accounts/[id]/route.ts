// app/api/accounts/[id]/route.ts
import { NextRequest } from "next/server";
import { requireAuth, apiSuccess, apiError, verifyAccountOwnership } from "@/server/security/guard";
import { getAccountById } from "@/server/services/account.service";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth();
  if ("errorResponse" in auth) return auth.errorResponse;

  const accountId = parseInt(params.id, 10);
  if (isNaN(accountId)) {
    return apiError("INVALID_ID", "รหัสบัญชีไม่ถูกต้อง", 400);
  }

  const account = getAccountById(accountId);
  if (!account) {
    return apiError("NOT_FOUND", "ไม่พบบัญชีธนาคาร", 404);
  }

  if (!verifyAccountOwnership(auth.user, account.id)) {
    return apiError("FORBIDDEN", "คุณไม่มีสิทธิ์เข้าถึงบัญชีนี้", 403);
  }

  return apiSuccess({ account });
}
