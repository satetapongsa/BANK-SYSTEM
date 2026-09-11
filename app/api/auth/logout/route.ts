// app/api/auth/logout/route.ts
import { NextRequest } from "next/server";
import { getCurrentSessionUser, SESSION_COOKIE_NAME } from "@/server/auth/session";
import { apiSuccess } from "@/server/security/guard";
import { logAudit } from "@/server/services/audit.service";

export async function POST(req: NextRequest) {
  const user = await getCurrentSessionUser();
  if (user) {
    await logAudit({
      actorUserId: user.id,
      action: "USER_LOGOUT",
      entityType: "USER",
      entityId: user.email,
      reason: "User initiated logout",
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      userAgent: req.headers.get("user-agent") || "Web/Client",
    });
  }

  const response = apiSuccess({ loggedOut: true });
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
