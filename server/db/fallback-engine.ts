// server/db/fallback-engine.ts
import fs from "fs";
import path from "path";
import { AsyncLocalStorage } from "node:async_hooks";
import bcrypt from "bcryptjs";
import Decimal from "decimal.js";
import {
  DbUser,
  DbBankAccount,
  DbTransaction,
  DbAuditLog,
  DbSession,
  DbNotification,
} from "./types";

export interface StorageSchema {
  users: DbUser[];
  bank_accounts: DbBankAccount[];
  transactions: DbTransaction[];
  audit_logs: DbAuditLog[];
  sessions: DbSession[];
  notifications: DbNotification[];
}

export interface TxContext {
  state: StorageSchema;
  getAccountForUpdate: (id: number) => DbBankAccount | undefined;
  getAccountByNumberForUpdate: (accountNumber: string) => DbBankAccount | undefined;
  checkBalanceNotNegative: (account: DbBankAccount) => void;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "apex_bank.json");

let memoryState: StorageSchema | null = null;
let writeLock: Promise<void> = Promise.resolve();
const txStorage = new AsyncLocalStorage<TxContext>();

function ensureStorage(): StorageSchema {
  if (memoryState) return memoryState;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DATA_FILE)) {
    try {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      memoryState = JSON.parse(content);
      return memoryState!;
    } catch (e) {
      console.warn("Could not read existing data file, re-initializing fallback storage.");
    }
  }

  // Seed default data
  const defaultPasswordHash = bcrypt.hashSync("Password123!", 10);
  const now = new Date().toISOString();

  const users: DbUser[] = [
    {
      id: 1,
      email: "admin@apexbank.com",
      password_hash: defaultPasswordHash,
      role: "ADMIN",
      first_name: "Executive",
      last_name: "Admin",
      phone: "+66-81-000-0001",
      status: "ACTIVE",
      created_at: now,
      updated_at: now,
      last_login_at: now,
    },
    {
      id: 2,
      email: "somchai@apexbank.com",
      password_hash: defaultPasswordHash,
      role: "MEMBER",
      first_name: "Somchai",
      last_name: "Prasert",
      phone: "+66-89-123-4567",
      status: "ACTIVE",
      created_at: now,
      updated_at: now,
      last_login_at: now,
    },
    {
      id: 3,
      email: "manee@apexbank.com",
      password_hash: defaultPasswordHash,
      role: "MEMBER",
      first_name: "Manee",
      last_name: "Jaidee",
      phone: "+66-86-987-6543",
      status: "ACTIVE",
      created_at: now,
      updated_at: now,
      last_login_at: now,
    },
    {
      id: 4,
      email: "ananda@apexbank.com",
      password_hash: defaultPasswordHash,
      role: "MEMBER",
      first_name: "Ananda",
      last_name: "Chaiyapruk",
      phone: "+66-82-555-8888",
      status: "ACTIVE",
      created_at: now,
      updated_at: now,
      last_login_at: now,
    },
  ];

  const bank_accounts: DbBankAccount[] = [
    {
      id: 1,
      user_id: 2,
      account_number: "1002345678",
      account_type: "SAVINGS",
      currency: "THB",
      balance: "125500.00",
      status: "ACTIVE",
      created_at: now,
      updated_at: now,
    },
    {
      id: 2,
      user_id: 3,
      account_number: "1008765432",
      account_type: "SAVINGS",
      currency: "THB",
      balance: "48200.50",
      status: "ACTIVE",
      created_at: now,
      updated_at: now,
    },
    {
      id: 3,
      user_id: 4,
      account_number: "1009998877",
      account_type: "FIXED",
      currency: "THB",
      balance: "350000.00",
      status: "ACTIVE",
      created_at: now,
      updated_at: now,
    },
  ];

  const transactions: DbTransaction[] = [
    {
      id: 1,
      transaction_reference: "TXN-20260901-000101",
      idempotency_key: "seed-deposit-1",
      type: "DEPOSIT",
      status: "COMPLETED",
      from_account_id: null,
      to_account_id: 1,
      amount: "150000.00",
      currency: "THB",
      description: "Initial account opening deposit",
      metadata: { channel: "BRANCH" },
      created_by: 1,
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      completed_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: 2,
      transaction_reference: "TXN-20260905-000202",
      idempotency_key: "seed-transfer-1",
      type: "TRANSFER",
      status: "COMPLETED",
      from_account_id: 1,
      to_account_id: 2,
      amount: "24500.00",
      currency: "THB",
      description: "Office supplies reimbursement",
      metadata: { channel: "ONLINE_BANKING" },
      created_by: 2,
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      completed_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ];

  const audit_logs: DbAuditLog[] = [
    {
      id: 1,
      actor_user_id: 1,
      action: "SYSTEM_INITIALIZED",
      entity_type: "SYSTEM",
      entity_id: "APEX-ROOT",
      before_data: null,
      after_data: { initialized: true },
      reason: "Genesis bootstrap of APEX Banking Platform",
      ip_address: "127.0.0.1",
      user_agent: "System/Bootstrap",
      created_at: now,
    },
  ];

  const notifications: DbNotification[] = [
    {
      id: 1,
      user_id: 2,
      title: "ยินดีต้อนรับสู่ APEX Digital Bank",
      message: "บัญชีของคุณได้รับการเปิดใช้งานเรียบร้อยแล้ว พร้อมทำธุรกรรมได้ทันที",
      type: "SUCCESS",
      is_read: false,
      link: "/portal",
      created_at: now,
    },
  ];

  memoryState = {
    users,
    bank_accounts,
    transactions,
    audit_logs,
    sessions: [],
    notifications,
  };

  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryState, null, 2), "utf-8");
  } catch (err) {
    console.error("Could not write initial data file:", err);
  }

  return memoryState;
}

function persistStorage(state: StorageSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist data file:", err);
  }
}

/**
 * Executes a locked, atomic transaction on the fallback storage.
 * Enforces ACID semantics:
 * - Isolation via async mutex lock
 * - Re-entrancy: If already in a transaction, reuses existing context
 * - Atomicity: if any error is thrown in fn, rollback entire mutation
 * - Consistency: verifies check constraints (e.g. balance >= 0)
 */
export async function withFallbackTx<T>(
  fn: (ctx: TxContext) => Promise<T>
): Promise<T> {
  const existingCtx = txStorage.getStore();
  if (existingCtx) {
    // Re-entrant execution within existing transaction boundary
    return fn(existingCtx);
  }

  const previousLock = writeLock;
  let releaseLock: () => void;
  writeLock = new Promise<void>((resolve) => {
    releaseLock = resolve;
  });

  await previousLock;

  try {
    const currentState = ensureStorage();
    // Deep clone state for transaction isolation / rollback capability
    const clonedState: StorageSchema = JSON.parse(JSON.stringify(currentState));

    const ctx: TxContext = {
      state: clonedState,
      getAccountForUpdate: (id: number) =>
        clonedState.bank_accounts.find((a) => a.id === id),
      getAccountByNumberForUpdate: (accNum: string) =>
        clonedState.bank_accounts.find((a) => a.account_number === accNum),
      checkBalanceNotNegative: (account: DbBankAccount) => {
        const bal = new Decimal(account.balance);
        if (bal.isNegative()) {
          throw new Error(
            `INSUFFICIENT_FUNDS: Account ${account.account_number} balance cannot be negative`
          );
        }
      },
    };

    const result = await txStorage.run(ctx, async () => {
      return fn(ctx);
    });

    // Commit transaction: update memory and persist
    memoryState = clonedState;
    persistStorage(memoryState);

    return result;
  } finally {
    releaseLock!();
  }
}

export function getFallbackState(): StorageSchema {
  const currentCtx = txStorage.getStore();
  if (currentCtx) return currentCtx.state;
  return ensureStorage();
}
