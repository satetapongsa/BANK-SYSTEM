// server/db/index.ts
import { Pool, neon } from "@neondatabase/serverless";
import { withFallbackTx, getFallbackState } from "./fallback-engine";
import {
  DbUser,
  DbBankAccount,
  DbTransaction,
  DbAuditLog,
  DbSession,
  DbNotification,
} from "./types";

const databaseUrl = process.env.DATABASE_URL?.trim() || "";

export const isNeonConfigured =
  databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://");

let neonPool: Pool | null = null;
let neonHttpSql: any = null;

if (isNeonConfigured) {
  try {
    neonPool = new Pool({ connectionString: databaseUrl });
    neonHttpSql = neon(databaseUrl);
  } catch (err) {
    console.warn("Failed to initialize Neon Pool, will use fallback engine:", err);
  }
}

export function getDbEngineName(): "NEON_POSTGRESQL" | "LOCAL_ACID_ENGINE" {
  return isNeonConfigured && neonPool ? "NEON_POSTGRESQL" : "LOCAL_ACID_ENGINE";
}

export { withFallbackTx, getFallbackState };
