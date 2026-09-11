// app/api/notifications/route.ts
import { NextRequest } from "next/server";
import { requireAuth, apiSuccess, apiError } from "@/server/security/guard";
import { getUserNotifications, markAsRead } from "@/server/services/notification.service";

export async function GET() {
  const auth = await requireAuth();
  if ("errorResponse" in auth) return auth.errorResponse;

  const notifications = getUserNotifications(auth.user.id);
  return apiSuccess({ notifications });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAuth();
  if ("errorResponse" in auth) return auth.errorResponse;

  const body = await req.json().catch(() => ({}));
  const notifId = Number(body.id);
  if (!notifId) {
    return apiError("INVALID_ID", "รหัสการแจ้งเตือนไม่ถูกต้อง", 400);
  }

  const success = await markAsRead(notifId, auth.user.id);
  return apiSuccess({ success });
}
