// app/api/transactions/route.ts
import { NextRequest } from "next/server";
import { requireAuth, apiSuccess } from "@/server/security/guard";
import { getFallbackState } from "@/server/db/fallback-engine";
import { getUserAccounts } from "@/server/services/account.service";

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if ("errorResponse" in auth) return auth.errorResponse;

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const reference = searchParams.get("reference");
  const limit = parseInt(searchParams.get("limit") || "30", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  const state = getFallbackState();
  let allTx = [...state.transactions];

  // If Member: filter by member's accounts
  if (auth.user.role !== "ADMIN") {
    const userAccountIds = getUserAccounts(auth.user.id).map((a) => a.id);
    allTx = allTx.filter(
      (t) =>
        (t.from_account_id && userAccountIds.includes(t.from_account_id)) ||
        (t.to_account_id && userAccountIds.includes(t.to_account_id))
    );
  }

  // Filter by type
  if (type && type !== "ALL") {
    allTx = allTx.filter((t) => t.type === type);
  }

  // Filter by reference
  if (reference) {
    allTx = allTx.filter((t) =>
      t.transaction_reference.toLowerCase().includes(reference.toLowerCase().trim())
    );
  }

  // Sort descending by created_at
  allTx.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const total = allTx.length;
  const paginated = allTx.slice(offset, offset + limit);

  // Enrich with account numbers for UI convenience
  const enriched = paginated.map((tx) => {
    const fromAcc = tx.from_account_id
      ? state.bank_accounts.find((a) => a.id === tx.from_account_id)
      : null;
    const toAcc = tx.to_account_id
      ? state.bank_accounts.find((a) => a.id === tx.to_account_id)
      : null;
    return {
      ...tx,
      from_account_number: fromAcc?.account_number || null,
      to_account_number: toAcc?.account_number || null,
    };
  });

  return apiSuccess({
    transactions: enriched,
    total,
    limit,
    offset,
  });
}
