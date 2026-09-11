// app/api/admin/database/route.ts
import { NextRequest } from "next/server";
import { requireAdmin, apiSuccess } from "@/server/security/guard";
import { getFallbackState } from "@/server/db/fallback-engine";
import { getDbEngineName } from "@/server/db";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if ("errorResponse" in auth) return auth.errorResponse;

  const state = getFallbackState();

  // Return clean, real-time database snapshot of all tables
  const users = state.users.map((u) => ({
    id: u.id,
    email: u.email,
    role: u.role,
    first_name: u.first_name,
    last_name: u.last_name,
    phone: u.phone,
    status: u.status,
    password_hash: u.password_hash.substring(0, 15) + "...",
    created_at: u.created_at,
    last_login_at: u.last_login_at,
  }));

  const bank_accounts = state.bank_accounts.map((a) => ({
    id: a.id,
    user_id: a.user_id,
    account_number: a.account_number,
    account_type: a.account_type,
    currency: a.currency,
    balance: a.balance,
    status: a.status,
    created_at: a.created_at,
    updated_at: a.updated_at,
  }));

  const transactions = state.transactions.map((t) => ({
    id: t.id,
    transaction_reference: t.transaction_reference,
    idempotency_key: t.idempotency_key,
    type: t.type,
    status: t.status,
    from_account_id: t.from_account_id,
    to_account_id: t.to_account_id,
    amount: t.amount,
    currency: t.currency,
    description: t.description,
    created_by: t.created_by,
    created_at: t.created_at,
  }));

  const audit_logs = state.audit_logs.map((l) => ({
    id: l.id,
    actor_user_id: l.actor_user_id,
    action: l.action,
    entity_type: l.entity_type,
    entity_id: l.entity_id,
    reason: l.reason,
    ip_address: l.ip_address,
    created_at: l.created_at,
  }));

  return apiSuccess({
    databaseEngine: getDbEngineName(),
    lastUpdated: new Date().toISOString(),
    stats: {
      usersCount: users.length,
      accountsCount: bank_accounts.length,
      transactionsCount: transactions.length,
      auditLogsCount: audit_logs.length,
    },
    tables: {
      users,
      bank_accounts,
      transactions,
      audit_logs,
    },
  });
}
