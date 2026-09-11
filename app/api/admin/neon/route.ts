// app/api/admin/neon/route.ts
import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { requireAdmin, apiSuccess, apiError } from "@/server/security/guard";
import { getDbEngineName, isNeonConfigured } from "@/server/db";
import { logAudit } from "@/server/services/audit.service";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if ("errorResponse" in auth) return auth.errorResponse;

  const databaseUrl = process.env.DATABASE_URL?.trim() || "";
  const schemaPath = path.join(process.cwd(), "server", "db", "schema.sql");
  let schemaContent = "";
  try {
    schemaContent = fs.readFileSync(schemaPath, "utf-8");
  } catch {
    schemaContent = "-- schema file not found";
  }

  // Mask database URL for security (e.g. postgresql://user:****@ep-xyz.neon.tech/neondb)
  let maskedUrl: string | null = null;
  if (databaseUrl) {
    try {
      const parsed = new URL(databaseUrl);
      parsed.password = "********";
      maskedUrl = parsed.toString();
    } catch {
      maskedUrl = databaseUrl.slice(0, 15) + "********";
    }
  }

  let connectionStatus: "CONNECTED" | "NOT_CONFIGURED" | "ERROR" = "NOT_CONFIGURED";
  let latencyMs: number | null = null;
  let detectedTables: string[] = [];
  let connectionError: string | null = null;

  if (isNeonConfigured && databaseUrl) {
    try {
      const start = Date.now();
      const sql = neon(databaseUrl);
      const testRes = await sql`SELECT 1 as connected`;
      latencyMs = Date.now() - start;

      if (testRes && testRes[0]?.connected === 1) {
        connectionStatus = "CONNECTED";
        const tablesRes = await sql`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
          ORDER BY table_name;
        `;
        detectedTables = tablesRes.map((r: any) => r.table_name);
      }
    } catch (err: any) {
      connectionStatus = "ERROR";
      connectionError = err?.message || "Failed to connect to Neon PostgreSQL";
    }
  }

  return apiSuccess({
    engine: getDbEngineName(),
    isConfigured: isNeonConfigured,
    maskedUrl,
    connectionStatus,
    latencyMs,
    detectedTables,
    connectionError,
    expectedTables: ["users", "bank_accounts", "transactions", "audit_logs", "sessions", "notifications"],
    schemaContent,
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ("errorResponse" in auth) return auth.errorResponse;

  const databaseUrl = process.env.DATABASE_URL?.trim() || "";
  if (!databaseUrl || (!databaseUrl.startsWith("postgres://") && !databaseUrl.startsWith("postgresql://"))) {
    return apiError(
      "NEON_NOT_CONFIGURED",
      "กรุณาระบุ DATABASE_URL ของ Neon PostgreSQL ในไฟล์ .env.local ก่อนทำการ Migrate",
      400
    );
  }

  try {
    const sql = neon(databaseUrl);
    const schemaPath = path.join(process.cwd(), "server", "db", "schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf-8");

    // Execute schema statements
    const statements = schemaSql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      await sql(statement);
    }

    // Seed initial users if table is empty
    const existing = await sql`SELECT count(*) as count FROM users`;
    let seeded = false;
    if (Number(existing[0]?.count || 0) === 0) {
      const passwordHash = bcrypt.hashSync("123456", 10);
      const adminHash = bcrypt.hashSync("admin", 10);

      // 1. Admin
      const [admin] = await sql`
        INSERT INTO users (email, password_hash, role, first_name, last_name, phone, status)
        VALUES ('admin@apexbank.com', ${adminHash}, 'ADMIN', 'Executive', 'Admin', '+66-81-000-0001', 'ACTIVE')
        RETURNING id
      `;

      // 2. Member Somchai
      const [member] = await sql`
        INSERT INTO users (email, password_hash, role, first_name, last_name, phone, status)
        VALUES ('somchai@apexbank.com', ${passwordHash}, 'MEMBER', 'Somchai', 'Prasert', '+66-89-123-4567', 'ACTIVE')
        RETURNING id
      `;

      // 3. Bank Account
      const [acc] = await sql`
        INSERT INTO bank_accounts (user_id, account_number, account_type, currency, balance, status)
        VALUES (${member.id}, '1002345678', 'SAVINGS', 'THB', 125500.00, 'ACTIVE')
        RETURNING id
      `;

      // 4. Initial Transaction
      await sql`
        INSERT INTO transactions (transaction_reference, idempotency_key, type, status, from_account_id, to_account_id, amount, currency, description, created_by)
        VALUES ('TXN-NEON-INITIAL-001', 'neon-seed-001', 'DEPOSIT', 'COMPLETED', NULL, ${acc.id}, 125500.00, 'THB', 'Initial Neon Genesis Opening Deposit', ${admin.id})
      `;

      seeded = true;
    }

    await logAudit({
      actorUserId: auth.user.id,
      action: "NEON_SCHEMA_MIGRATED",
      entityType: "DATABASE",
      entityId: "NEON_POSTGRESQL",
      reason: `Admin migrated schema on Neon DB (seeded=${seeded})`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return apiSuccess({
      message: "ติดตั้งโครงสร้างฐานข้อมูลบน Neon PostgreSQL สำเร็จเรียบร้อย!",
      seeded,
    });
  } catch (err: any) {
    console.error("Neon Migration Error:", err);
    return apiError("MIGRATION_FAILED", `เกิดข้อผิดพลาดในการรัน Schema: ${err?.message}`, 500);
  }
}
