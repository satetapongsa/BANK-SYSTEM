// app/api/admin/overview/route.ts
import Decimal from "decimal.js";
import { requireAdmin, apiSuccess } from "@/server/security/guard";
import { getFallbackState } from "@/server/db/fallback-engine";
import { getDbEngineName } from "@/server/db";

export async function GET() {
  const auth = await requireAdmin();
  if ("errorResponse" in auth) return auth.errorResponse;

  const state = getFallbackState();
  const todayStr = new Date().toISOString().slice(0, 10);

  const totalUsers = state.users.length;
  const activeUsers = state.users.filter((u) => u.status === "ACTIVE").length;

  const totalAccounts = state.bank_accounts.length;
  const activeAccounts = state.bank_accounts.filter((a) => a.status === "ACTIVE").length;

  // Total balance sum
  const totalBalance = state.bank_accounts.reduce(
    (acc, cur) => acc.plus(new Decimal(cur.balance)),
    new Decimal(0)
  );

  // Breakdown metrics
  let totalDeposits = new Decimal(0);
  let totalWithdrawals = new Decimal(0);
  let totalTransfers = new Decimal(0);

  let todayDeposits = new Decimal(0);
  let todayWithdrawals = new Decimal(0);
  let todayTransfers = new Decimal(0);

  for (const tx of state.transactions) {
    if (tx.status !== "COMPLETED") continue;
    const amount = new Decimal(tx.amount);
    const isToday = tx.created_at.startsWith(todayStr);

    if (tx.type === "DEPOSIT") {
      totalDeposits = totalDeposits.plus(amount);
      if (isToday) todayDeposits = todayDeposits.plus(amount);
    } else if (tx.type === "WITHDRAW") {
      totalWithdrawals = totalWithdrawals.plus(amount);
      if (isToday) todayWithdrawals = todayWithdrawals.plus(amount);
    } else if (tx.type === "TRANSFER") {
      totalTransfers = totalTransfers.plus(amount);
      if (isToday) todayTransfers = todayTransfers.plus(amount);
    }
  }

  // Recent 10 transactions enriched
  const recentTransactions = [...state.transactions]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)
    .map((tx) => {
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

  // Recent 5 audit logs
  const recentAudits = [...state.audit_logs]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return apiSuccess({
    metrics: {
      totalUsers,
      activeUsers,
      totalAccounts,
      activeAccounts,
      totalBalance: totalBalance.toFixed(2),
      totalDeposits: totalDeposits.toFixed(2),
      totalWithdrawals: totalWithdrawals.toFixed(2),
      totalTransfers: totalTransfers.toFixed(2),
      todayDeposits: todayDeposits.toFixed(2),
      todayWithdrawals: todayWithdrawals.toFixed(2),
      todayTransfers: todayTransfers.toFixed(2),
      totalTransactionsCount: state.transactions.length,
    },
    recentTransactions,
    recentAudits,
    databaseEngine: getDbEngineName(),
  });
}
