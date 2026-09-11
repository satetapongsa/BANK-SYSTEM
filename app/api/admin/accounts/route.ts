// app/api/admin/accounts/route.ts
import { NextRequest } from "next/server";
import { requireAdmin, apiSuccess } from "@/server/security/guard";
import { getAllAccounts } from "@/server/services/account.service";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if ("errorResponse" in auth) return auth.errorResponse;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.toLowerCase() || "";

  let accounts = getAllAccounts();
  if (q) {
    accounts = accounts.filter(
      (a) =>
        a.account_number.includes(q) ||
        a.owner_email.toLowerCase().includes(q) ||
        a.owner_name.toLowerCase().includes(q)
    );
  }

  return apiSuccess({ accounts });
}
