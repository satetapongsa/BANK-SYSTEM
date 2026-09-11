// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { getCurrentSessionUser } from "@/server/auth/session";
import { getUserAccounts } from "@/server/services/account.service";
import { getUnreadCount } from "@/server/services/notification.service";
import { getDbEngineName } from "@/server/db";
import { apiSuccess, apiError } from "@/server/security/guard";

export async function GET() {
  const user = await getCurrentSessionUser();
  if (!user) {
    return apiError("UNAUTHENTICATED", "ยังไม่ได้เข้าสู่ระบบ", 401);
  }

  const accounts = getUserAccounts(user.id);
  const unreadCount = getUnreadCount(user.id);

  return apiSuccess({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      status: user.status,
      created_at: user.created_at,
      last_login_at: user.last_login_at,
    },
    accounts,
    unreadNotifications: unreadCount,
    engine: getDbEngineName(),
  });
}
