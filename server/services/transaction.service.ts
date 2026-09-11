// server/services/transaction.service.ts
import Decimal from "decimal.js";
import { withFallbackTx, getFallbackState } from "../db/fallback-engine";
import { DbTransaction, TransactionType } from "../db/types";
import { createNotification } from "./notification.service";
import { logAudit } from "./audit.service";

/** Helper to generate unique transaction reference e.g. TXN-20260911-8F4K92 */
export function generateTransactionReference(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN-${dateStr}-${rand}`;
}

export interface DepositInput {
  accountId: number;
  amount: number;
  description?: string;
  actorId: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface WithdrawInput {
  accountId: number;
  amount: number;
  description?: string;
  actorId: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface TransferInput {
  fromAccountId: number;
  toAccountNumber: string;
  amount: number;
  description?: string;
  actorId: number;
  idempotencyKey?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AdjustmentInput {
  accountId: number;
  type: "CREDIT" | "DEBIT";
  amount: number;
  reason: string;
  actorId: number;
  ipAddress?: string;
  userAgent?: string;
}

export async function processDeposit(input: DepositInput): Promise<DbTransaction> {
  const decimalAmount = new Decimal(input.amount);
  if (decimalAmount.lessThanOrEqualTo(0)) {
    throw new Error("INVALID_AMOUNT: จำนวนเงินฝากต้องมากกว่า 0.00 บาท");
  }

  return withFallbackTx(async ({ state, getAccountForUpdate, checkBalanceNotNegative }) => {
    const account = getAccountForUpdate(input.accountId);
    if (!account) {
      throw new Error("ACCOUNT_NOT_FOUND: ไม่พบบัญชีธนาคารที่ระบุ");
    }
    if (account.status !== "ACTIVE") {
      throw new Error(`ACCOUNT_INACTIVE: บัญชีอยู่ในสถานะ ${account.status} ไม่สามารถทำธุรกรรมได้`);
    }

    const beforeBalance = account.balance;
    const newBalance = new Decimal(account.balance).plus(decimalAmount).toFixed(2);
    account.balance = newBalance;
    account.updated_at = new Date().toISOString();

    checkBalanceNotNegative(account);

    const ref = generateTransactionReference();
    const tx: DbTransaction = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      transaction_reference: ref,
      idempotency_key: null,
      type: "DEPOSIT",
      status: "COMPLETED",
      from_account_id: null,
      to_account_id: account.id,
      amount: decimalAmount.toFixed(2),
      currency: account.currency,
      description: input.description || "ฝากเงินเข้าบัญชี",
      metadata: { before_balance: beforeBalance, after_balance: newBalance },
      created_by: input.actorId,
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    };

    state.transactions.unshift(tx);

    // Audit log
    await logAudit({
      actorUserId: input.actorId,
      action: "DEPOSIT_COMPLETED",
      entityType: "TRANSACTION",
      entityId: ref,
      beforeData: { balance: beforeBalance },
      afterData: { balance: newBalance, amount: decimalAmount.toFixed(2) },
      reason: input.description,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });

    // Notify account owner
    await createNotification({
      userId: account.user_id,
      title: "เงินเข้าบัญชีสำเร็จ",
      message: `มีเงินฝากเข้าบัญชี ${account.account_number} จำนวน ฿${decimalAmount.toFixed(2)} บาท`,
      type: "SUCCESS",
      link: "/portal",
    });

    return tx;
  });
}

export async function processWithdraw(input: WithdrawInput): Promise<DbTransaction> {
  const decimalAmount = new Decimal(input.amount);
  if (decimalAmount.lessThanOrEqualTo(0)) {
    throw new Error("INVALID_AMOUNT: จำนวนเงินถอนต้องมากกว่า 0.00 บาท");
  }

  return withFallbackTx(async ({ state, getAccountForUpdate, checkBalanceNotNegative }) => {
    const account = getAccountForUpdate(input.accountId);
    if (!account) {
      throw new Error("ACCOUNT_NOT_FOUND: ไม่พบบัญชีธนาคารที่ระบุ");
    }
    if (account.status !== "ACTIVE") {
      throw new Error(`ACCOUNT_INACTIVE: บัญชีอยู่ในสถานะ ${account.status} ไม่สามารถทำธุรกรรมได้`);
    }

    const currentBalance = new Decimal(account.balance);
    if (currentBalance.lessThan(decimalAmount)) {
      throw new Error(
        `INSUFFICIENT_FUNDS: ยอดเงินคงเหลือไม่เพียงพอ (คงเหลือ ฿${currentBalance.toFixed(2)} บาท)`
      );
    }

    const beforeBalance = account.balance;
    const newBalance = currentBalance.minus(decimalAmount).toFixed(2);
    account.balance = newBalance;
    account.updated_at = new Date().toISOString();

    checkBalanceNotNegative(account);

    const ref = generateTransactionReference();
    const tx: DbTransaction = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      transaction_reference: ref,
      idempotency_key: null,
      type: "WITHDRAW",
      status: "COMPLETED",
      from_account_id: account.id,
      to_account_id: null,
      amount: decimalAmount.toFixed(2),
      currency: account.currency,
      description: input.description || "ถอนเงินสด",
      metadata: { before_balance: beforeBalance, after_balance: newBalance },
      created_by: input.actorId,
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    };

    state.transactions.unshift(tx);

    // Audit log
    await logAudit({
      actorUserId: input.actorId,
      action: "WITHDRAW_COMPLETED",
      entityType: "TRANSACTION",
      entityId: ref,
      beforeData: { balance: beforeBalance },
      afterData: { balance: newBalance, amount: decimalAmount.toFixed(2) },
      reason: input.description,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });

    // Notify account owner
    await createNotification({
      userId: account.user_id,
      title: "ถอนเงินสำเร็จ",
      message: `ถอนเงินจากบัญชี ${account.account_number} จำนวน ฿${decimalAmount.toFixed(2)} บาท ยอดคงเหลือ ฿${newBalance} บาท`,
      type: "WARNING",
      link: "/portal",
    });

    return tx;
  });
}

export async function processTransfer(input: TransferInput): Promise<DbTransaction> {
  const decimalAmount = new Decimal(input.amount);
  if (decimalAmount.lessThanOrEqualTo(0)) {
    throw new Error("INVALID_AMOUNT: จำนวนเงินโอนต้องมากกว่า 0.00 บาท");
  }

  return withFallbackTx(
    async ({
      state,
      getAccountForUpdate,
      getAccountByNumberForUpdate,
      checkBalanceNotNegative,
    }) => {
      // 1. Idempotency Check
      if (input.idempotencyKey) {
        const existing = state.transactions.find(
          (t) => t.idempotency_key === input.idempotencyKey
        );
        if (existing) {
          return existing;
        }
      }

      // 2. Fetch & Lock Source and Destination Accounts
      const senderAccount = getAccountForUpdate(input.fromAccountId);
      if (!senderAccount) {
        throw new Error("ACCOUNT_NOT_FOUND: ไม่พบบัญชีต้นทาง");
      }
      if (senderAccount.status !== "ACTIVE") {
        throw new Error(`ACCOUNT_INACTIVE: บัญชีต้นทางอยู่ในสถานะ ${senderAccount.status}`);
      }

      const recipientAccount = getAccountByNumberForUpdate(input.toAccountNumber.trim());
      if (!recipientAccount) {
        throw new Error("RECIPIENT_NOT_FOUND: ไม่พบบัญชีปลายทาง กรุณาตรวจสอบเลขบัญชีให้ถูกต้อง");
      }
      if (recipientAccount.status !== "ACTIVE") {
        throw new Error(`RECIPIENT_INACTIVE: บัญชีปลายทางไม่สามารถรับเงินได้ (สถานะ: ${recipientAccount.status})`);
      }

      if (senderAccount.account_number === recipientAccount.account_number) {
        throw new Error("SAME_ACCOUNT: ไม่สามารถโอนเงินไปยังบัญชีเดียวกันได้");
      }

      // 3. Balance verification
      const senderBal = new Decimal(senderAccount.balance);
      if (senderBal.lessThan(decimalAmount)) {
        throw new Error(
          `INSUFFICIENT_FUNDS: ยอดเงินในบัญชีต้นทางไม่พอสำหรับการโอน (คงเหลือ ฿${senderBal.toFixed(2)} บาท)`
        );
      }

      // 4. Atomic balance mutation
      const senderBefore = senderAccount.balance;
      const recipientBefore = recipientAccount.balance;

      senderAccount.balance = senderBal.minus(decimalAmount).toFixed(2);
      senderAccount.updated_at = new Date().toISOString();

      recipientAccount.balance = new Decimal(recipientAccount.balance).plus(decimalAmount).toFixed(2);
      recipientAccount.updated_at = new Date().toISOString();

      // Assert non-negative constraints
      checkBalanceNotNegative(senderAccount);
      checkBalanceNotNegative(recipientAccount);

      // 5. Create Transaction Record
      const ref = generateTransactionReference();
      const tx: DbTransaction = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        transaction_reference: ref,
        idempotency_key: input.idempotencyKey || null,
        type: "TRANSFER",
        status: "COMPLETED",
        from_account_id: senderAccount.id,
        to_account_id: recipientAccount.id,
        amount: decimalAmount.toFixed(2),
        currency: senderAccount.currency,
        description: input.description || "โอนเงิน",
        metadata: {
          sender_account: senderAccount.account_number,
          recipient_account: recipientAccount.account_number,
          sender_before: senderBefore,
          sender_after: senderAccount.balance,
          recipient_before: recipientBefore,
          recipient_after: recipientAccount.balance,
        },
        created_by: input.actorId,
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      };

      state.transactions.unshift(tx);

      // 6. Audit Log
      await logAudit({
        actorUserId: input.actorId,
        action: "TRANSFER_COMPLETED",
        entityType: "TRANSACTION",
        entityId: ref,
        beforeData: { sender_balance: senderBefore, recipient_balance: recipientBefore },
        afterData: {
          sender_balance: senderAccount.balance,
          recipient_balance: recipientAccount.balance,
          amount: decimalAmount.toFixed(2),
        },
        reason: input.description,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      });

      // 7. Notify Sender & Receiver
      await createNotification({
        userId: senderAccount.user_id,
        title: "โอนเงินสำเร็จ",
        message: `โอนเงิน ฿${decimalAmount.toFixed(2)} บาท ไปยังบัญชี ${recipientAccount.account_number} เรียบร้อยแล้ว`,
        type: "SUCCESS",
        link: `/portal/transactions`,
      });

      await createNotification({
        userId: recipientAccount.user_id,
        title: "ได้รับเงินโอนเข้าบัญชี",
        message: `ได้รับเงินโอน ฿${decimalAmount.toFixed(2)} บาท จากบัญชี ${senderAccount.account_number}`,
        type: "SUCCESS",
        link: `/portal/transactions`,
      });

      return tx;
    }
  );
}

export async function processAdminAdjustment(input: AdjustmentInput): Promise<DbTransaction> {
  const decimalAmount = new Decimal(input.amount);
  if (decimalAmount.lessThanOrEqualTo(0)) {
    throw new Error("INVALID_AMOUNT: ยอดเงินปรับปรุงต้องมากกว่า 0.00 บาท");
  }
  if (!input.reason || input.reason.trim().length < 5) {
    throw new Error("INVALID_REASON: ต้องระบุเหตุผลในการปรับยอดเงินอย่างน้อย 5 ตัวอักษร");
  }

  return withFallbackTx(async ({ state, getAccountForUpdate, checkBalanceNotNegative }) => {
    const account = getAccountForUpdate(input.accountId);
    if (!account) {
      throw new Error("ACCOUNT_NOT_FOUND: ไม่พบบัญชีธนาคาร");
    }

    const beforeBalance = account.balance;
    let afterBalance: string;

    if (input.type === "CREDIT") {
      afterBalance = new Decimal(account.balance).plus(decimalAmount).toFixed(2);
    } else {
      const curBal = new Decimal(account.balance);
      if (curBal.lessThan(decimalAmount)) {
        throw new Error(
          `INSUFFICIENT_FUNDS: ไม่สามารถหักยอดเงินได้เนื่องจากคงเหลือไม่พอ (คงเหลือ ฿${curBal.toFixed(2)} บาท)`
        );
      }
      afterBalance = curBal.minus(decimalAmount).toFixed(2);
    }

    account.balance = afterBalance;
    account.updated_at = new Date().toISOString();
    checkBalanceNotNegative(account);

    const ref = generateTransactionReference();
    const tx: DbTransaction = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      transaction_reference: ref,
      idempotency_key: null,
      type: "ADJUSTMENT",
      status: "COMPLETED",
      from_account_id: input.type === "DEBIT" ? account.id : null,
      to_account_id: input.type === "CREDIT" ? account.id : null,
      amount: decimalAmount.toFixed(2),
      currency: account.currency,
      description: `[ADMIN ADJUSTMENT ${input.type}] ${input.reason}`,
      metadata: {
        adjustment_type: input.type,
        before_balance: beforeBalance,
        after_balance: afterBalance,
        reason: input.reason,
      },
      created_by: input.actorId,
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    };

    state.transactions.unshift(tx);

    // Mandatory Admin Audit Log
    await logAudit({
      actorUserId: input.actorId,
      action: `ADMIN_ADJUSTMENT_${input.type}`,
      entityType: "BANK_ACCOUNT",
      entityId: account.account_number,
      beforeData: { balance: beforeBalance },
      afterData: { balance: afterBalance, adjustment: decimalAmount.toFixed(2) },
      reason: input.reason,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });

    // Notify user of administrative change
    await createNotification({
      userId: account.user_id,
      title: `แจ้งเตือนการปรับปรุงยอดเงิน (${input.type})`,
      message: `เจ้าหน้าที่ได้ปรับปรุงยอดเงินในบัญชี ${account.account_number} จำนวน ฿${decimalAmount.toFixed(2)} บาท เนื่องจาก: ${input.reason}`,
      type: "WARNING",
      link: "/portal",
    });

    return tx;
  });
}
