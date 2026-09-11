// app/api/accounts/route.ts
import { NextRequest } from "next/server";
import { requireAuth, apiSuccess, apiError } from "@/server/security/guard";
import { getUserAccounts, getAllAccounts, createBankAccount } from "@/server/services/account.service";

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if ("errorResponse" in auth) return auth.errorResponse;

  const { searchParams } = new URL(req.url);
  const viewAll = searchParams.get("all") === "true";

  if (viewAll && auth.user.role === "ADMIN") {
    const all = getAllAccounts();
    return apiSuccess({ accounts: all });
  }

  const myAccounts = getUserAccounts(auth.user.id);
  return apiSuccess({ accounts: myAccounts });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if ("errorResponse" in auth) return auth.errorResponse;

  try {
    const body = await req.json().catch(() => ({}));
    const account = await createBankAccount({
      userId: auth.user.id,
      accountType: body.accountType || "SAVINGS",
      initialDeposit: body.initialDeposit ? Number(body.initialDeposit) : 0,
      actorId: auth.user.id,
    });

    return apiSuccess({ account }, 201);
  } catch (error: any) {
    return apiError("ACCOUNT_CREATION_FAILED", error.message || "ไม่สามารถเปิดบัญชีใหม่ได้", 400);
  }
}
