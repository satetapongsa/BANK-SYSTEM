// app/api/auth/register/route.ts
import { NextRequest } from "next/server";
import { registerSchema } from "@/lib/schemas";
import { createUser } from "@/server/services/user.service";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/server/auth/session";
import { apiError, apiSuccess, checkRateLimit } from "@/server/security/guard";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const rateCheck = checkRateLimit(`register_${ip}`, 5, 60);
    if (!rateCheck.allowed) {
      return apiError("RATE_LIMITED", "คำขอบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่", 429);
    }

    const body = await req.json().catch(() => ({}));
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", parsed.error.errors[0]?.message || "ข้อมูลไม่ถูกต้อง", 400);
    }

    const newUser = await createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      role: "MEMBER",
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      phone: parsed.data.phone,
      initialDeposit: 1000.00, // Promotional initial gift deposit for new accounts
    });

    const token = await createSessionToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      firstName: newUser.first_name,
      lastName: newUser.last_name,
    });

    const response = apiSuccess({ user: newUser }, 201);
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    if (error.message?.includes("EMAIL_ALREADY_EXISTS")) {
      return apiError("EMAIL_EXISTS", "อีเมลนี้ลงทะเบียนในระบบแล้ว กรุณาเข้าสู่ระบบ", 409);
    }
    console.error("Register error:", error);
    return apiError("SERVER_ERROR", "ไม่สามารถลงทะเบียนได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง", 500);
  }
}
