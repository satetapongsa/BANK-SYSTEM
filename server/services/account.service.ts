// server/services/account.service.ts
import Decimal from "decimal.js";
import { getFallbackState, withFallbackTx } from "../db/fallback-engine";
import { DbBankAccount, AccountStatus } from "../db/types";
import { logAudit } from "./audit.service";
import { createNotification } from "./notification.service";

/** Generate a unique 10-digit account number starting with 100 or 101 */
export function generateAccountNumber(): string {
  const prefix = "100";
  const randomSuffix = Math.floor(1000000 + Math.random() * 9000000).toString();
  return `${prefix}${randomSuffix.slice(0, 7)}`;
}

export function getUserAccounts(userId: number): DbBankAccount[] {
  const state = getFallbackState();
  return state.bank_accounts.filter((a) => a.user_id === userId);
}

export function getAccountById(id: number): DbBankAccount | undefined {
  const state = getFallbackState();
  return state.bank_accounts.find((a) => a.id === id);
}

export function getAccountByNumber(accNum: string): DbBankAccount | undefined {
  const state = getFallbackState();
  return state.bank_accounts.find((a) => a.account_number === accNum.trim());
}

export function getAllAccounts(): (DbBankAccount & { owner_email: string; owner_name: string })[] {
  const state = getFallbackState();
  return state.bank_accounts.map((acc) => {
    const user = state.users.find((u) => u.id === acc.user_id);
    return {
      ...acc,
      owner_email: user?.email || "Unknown",
      owner_name: user ? `${user.first_name} ${user.last_name}` : "Unknown",
    };
  });
}

export async function createBankAccount(params: {
  userId: number;
  accountType?: string;
  initialDeposit?: number;
  actorId: number;
}): Promise<DbBankAccount> {
  let accNum = generateAccountNumber();
  const state = getFallbackState();
  while (state.bank_accounts.some((a) => a.account_number === accNum)) {
    accNum = generateAccountNumber();
  }

  const deposit = params.initialDeposit && params.initialDeposit > 0 ? params.initialDeposit : 0;
  const balanceStr = new Decimal(deposit).toFixed(2);
  const now = new Date().toISOString();

  const newAccount: DbBankAccount = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    user_id: params.userId,
    account_number: accNum,
    account_type: params.accountType || "SAVINGS",
    currency: "THB",
    balance: balanceStr,
    status: "ACTIVE",
    created_at: now,
    updated_at: now,
  };

  await withFallbackTx(async ({ state }) => {
    state.bank_accounts.push(newAccount);
  });

  await logAudit({
    actorUserId: params.actorId,
    action: "ACCOUNT_CREATED",
    entityType: "BANK_ACCOUNT",
    entityId: accNum,
    afterData: { account_number: accNum, initial_balance: balanceStr },
    reason: "New bank account provisioned",
  });

  await createNotification({
    userId: params.userId,
    title: "เปิดบัญชีใหม่สำเร็จ",
    message: `บัญชีเงินฝาก ${accNum} ของคุณพร้อมใช้งานแล้ว`,
    type: "SUCCESS",
    link: "/portal",
  });

  return newAccount;
}

export async function updateAccountStatus(
  accountId: number,
  newStatus: AccountStatus,
  reason: string,
  actorId: number
): Promise<DbBankAccount> {
  return withFallbackTx(async ({ state, getAccountForUpdate }) => {
    const acc = getAccountForUpdate(accountId);
    if (!acc) throw new Error("ACCOUNT_NOT_FOUND: ไม่พบบัญชีธนาคาร");

    const beforeStatus = acc.status;
    acc.status = newStatus;
    acc.updated_at = new Date().toISOString();

    await logAudit({
      actorUserId: actorId,
      action: `ACCOUNT_STATUS_${newStatus}`,
      entityType: "BANK_ACCOUNT",
      entityId: acc.account_number,
      beforeData: { status: beforeStatus },
      afterData: { status: newStatus },
      reason,
    });

    await createNotification({
      userId: acc.user_id,
      title: "สถานะบัญชีธนาคารเปลี่ยนแปลง",
      message: `บัญชี ${acc.account_number} เปลี่ยนเป็น ${newStatus} เนื่องจาก: ${reason}`,
      type: newStatus === "ACTIVE" ? "SUCCESS" : "WARNING",
    });

    return acc;
  });
}
