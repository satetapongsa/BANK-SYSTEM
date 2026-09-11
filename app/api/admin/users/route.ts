// app/api/admin/users/route.ts
import { NextRequest } from "next/server";
import Decimal from "decimal.js";
import { requireAdmin, apiSuccess, apiError } from "@/server/security/guard";
import { getFallbackState } from "@/server/db/fallback-engine";
import { createUser } from "@/server/services/user.service";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if ("errorResponse" in auth) return auth.errorResponse;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.toLowerCase() || "";

  const state = getFallbackState();
  let users = state.users.map(({ password_hash, ...u }) => {
    const userAccounts = state.bank_accounts.filter((a) => a.user_id === u.id);
    const totalBalance = userAccounts.reduce(
      (sum, acc) => sum.plus(new Decimal(acc.balance)),
      new Decimal(0)
    );
    return {
      ...u,
      accounts: userAccounts,
      accountsCount: userAccounts.length,
      totalBalance: totalBalance.toFixed(2),
    };
  });

  if (q) {
    users = users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        u.first_name.toLowerCase().includes(q) ||
        u.last_name.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q))
    );
  }

  return apiSuccess({ users });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ("errorResponse" in auth) return auth.errorResponse;

  try {
    const body = await req.json().catch(() => ({}));
    if (!body.email || !body.password || !body.first_name || !body.last_name) {
      return apiError("VALIDATION_ERROR", "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน", 400);
    }

    const newUser = await createUser({
      email: body.email,
      password: body.password,
      role: body.role === "ADMIN" ? "ADMIN" : "MEMBER",
      first_name: body.first_name,
      last_name: body.last_name,
      phone: body.phone,
      initialDeposit: body.initialDeposit ? Number(body.initialDeposit) : 0,
      actorId: auth.user.id,
    });

    return apiSuccess({ user: newUser }, 201);
  } catch (error: any) {
    return apiError("USER_CREATION_FAILED", error.message || "ไม่สามารถเพิ่มผู้ใช้งานได้", 400);
  }
}
