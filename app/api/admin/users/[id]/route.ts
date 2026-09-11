// app/api/admin/users/[id]/route.ts
import { NextRequest } from "next/server";
import { requireAdmin, apiSuccess, apiError } from "@/server/security/guard";
import { updateUserStatusSchema } from "@/lib/schemas";
import { updateUserStatus, getUserById } from "@/server/services/user.service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if ("errorResponse" in auth) return auth.errorResponse;

  const targetUserId = parseInt(params.id, 10);
  if (isNaN(targetUserId)) {
    return apiError("INVALID_ID", "รหัสผู้ใช้ไม่ถูกต้อง", 400);
  }

  const existing = getUserById(targetUserId);
  if (!existing) {
    return apiError("NOT_FOUND", "ไม่พบผู้ใช้ในระบบ", 404);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const parsed = updateUserStatusSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", parsed.error.errors[0]?.message || "ข้อมูลไม่ถูกต้อง", 400);
    }

    const updatedUser = await updateUserStatus(
      targetUserId,
      parsed.data.status,
      parsed.data.reason,
      auth.user.id
    );

    const { password_hash: _, ...safeUser } = updatedUser;
    return apiSuccess({ user: safeUser });
  } catch (error: any) {
    return apiError("UPDATE_FAILED", error.message || "ไม่สามารถเปลี่ยนสถานะผู้ใช้ได้", 400);
  }
}
