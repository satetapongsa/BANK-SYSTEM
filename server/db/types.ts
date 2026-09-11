// server/db/types.ts

export type UserRole = "ADMIN" | "MEMBER";
export type UserStatus = "ACTIVE" | "SUSPENDED";
export type AccountStatus = "ACTIVE" | "SUSPENDED" | "CLOSED";
export type TransactionType = "DEPOSIT" | "WITHDRAW" | "TRANSFER" | "ADJUSTMENT";
export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
export type NotificationType = "INFO" | "SUCCESS" | "WARNING" | "ERROR";

export interface DbUser {
  id: number;
  email: string;
  password_hash: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  phone?: string | null;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  last_login_at?: string | null;
}

export interface DbBankAccount {
  id: number;
  user_id: number;
  account_number: string;
  account_type: string;
  currency: string;
  balance: string; // Stored as NUMERIC string for precision (e.g. "125000.00")
  status: AccountStatus;
  created_at: string;
  updated_at: string;
}

export interface DbTransaction {
  id: number;
  transaction_reference: string;
  idempotency_key?: string | null;
  type: TransactionType;
  status: TransactionStatus;
  from_account_id?: number | null;
  to_account_id?: number | null;
  amount: string; // Numeric string (e.g. "5000.00")
  currency: string;
  description?: string | null;
  metadata?: Record<string, any> | null;
  created_by: number;
  created_at: string;
  completed_at?: string | null;
}

export interface DbAuditLog {
  id: number;
  actor_user_id?: number | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  before_data?: Record<string, any> | null;
  after_data?: Record<string, any> | null;
  reason?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
}

export interface DbSession {
  id: string;
  user_id: number;
  expires_at: string;
  created_at: string;
}

export interface DbNotification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  link?: string | null;
  created_at: string;
}
