// scripts/setup-db.ts
import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { getFallbackState } from "../server/db/fallback-engine";

async function main() {
  console.log("==================================================");
  console.log("  APEX DIGITAL BANKING - DATABASE SETUP & SEED    ");
  console.log("==================================================");

  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (databaseUrl && (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://"))) {
    console.log("📡 Connecting to Neon PostgreSQL...");
    try {
      const sql = neon(databaseUrl);
      const schemaPath = path.join(process.cwd(), "server", "db", "schema.sql");
      const schemaSql = fs.readFileSync(schemaPath, "utf-8");

      console.log("📄 Executing Schema DDL...");
      // Split statements and execute
      const statements = schemaSql
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const statement of statements) {
        await sql(statement);
      }
      console.log("✅ Tables and indexes initialized successfully on Neon!");

      // Seed Users if not present
      const existing = await sql`SELECT count(*) as count FROM users`;
      if (Number(existing[0]?.count || 0) === 0) {
        console.log("🌱 Seeding initial accounts on Neon...");
        const passwordHash = bcrypt.hashSync("Password123!", 10);
        
        // 1. Admin
        const [admin] = await sql`
          INSERT INTO users (email, password_hash, role, first_name, last_name, phone, status)
          VALUES ('admin@apexbank.com', ${passwordHash}, 'ADMIN', 'Executive', 'Admin', '+66-81-000-0001', 'ACTIVE')
          RETURNING id
        `;

        // 2. Members
        const [member1] = await sql`
          INSERT INTO users (email, password_hash, role, first_name, last_name, phone, status)
          VALUES ('somchai@apexbank.com', ${passwordHash}, 'MEMBER', 'Somchai', 'Prasert', '+66-89-123-4567', 'ACTIVE')
          RETURNING id
        `;

        const [member2] = await sql`
          INSERT INTO users (email, password_hash, role, first_name, last_name, phone, status)
          VALUES ('manee@apexbank.com', ${passwordHash}, 'MEMBER', 'Manee', 'Jaidee', '+66-86-987-6543', 'ACTIVE')
          RETURNING id
        `;

        // 3. Bank Accounts
        const [acc1] = await sql`
          INSERT INTO bank_accounts (user_id, account_number, account_type, currency, balance, status)
          VALUES (${member1.id}, '1002345678', 'SAVINGS', 'THB', 125500.00, 'ACTIVE')
          RETURNING id
        `;

        const [acc2] = await sql`
          INSERT INTO bank_accounts (user_id, account_number, account_type, currency, balance, status)
          VALUES (${member2.id}, '1008765432', 'SAVINGS', 'THB', 48200.50, 'ACTIVE')
          RETURNING id
        `;

        // 4. Initial Transaction & Audit
        await sql`
          INSERT INTO transactions (transaction_reference, idempotency_key, type, status, from_account_id, to_account_id, amount, currency, description, created_by)
          VALUES ('TXN-20260901-000101', 'seed-deposit-1', 'DEPOSIT', 'COMPLETED', NULL, ${acc1.id}, 150000.00, 'THB', 'Initial account opening deposit', ${admin.id})
        `;

        await sql`
          INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, reason, ip_address, user_agent)
          VALUES (${admin.id}, 'SYSTEM_INITIALIZED', 'SYSTEM', 'NEON-GENESIS', 'Initial deployment bootstrap on Neon DB', '127.0.0.1', 'CLI/Setup')
        `;

        console.log("🎉 Neon PostgreSQL seeding complete!");
      } else {
        console.log("ℹ️ Neon database already contains data, skipping seed.");
      }
    } catch (err) {
      console.error("❌ Error setting up Neon DB:", err);
      process.exit(1);
    }
  } else {
    console.log("📁 DATABASE_URL not set or not a PostgreSQL URL.");
    console.log("⚙️  Initializing fallback transactional database...");
    const state = getFallbackState();
    console.log(`✅ Fallback storage ready at data/apex_bank.json with ${state.users.length} users and ${state.bank_accounts.length} accounts.`);
    console.log("💡 Tip: Provide DATABASE_URL in .env.local to link your Neon database!");
  }

  console.log("\nCredentials for testing:");
  console.log("-----------------------------------------");
  console.log("👑 ADMIN:  admin@apexbank.com   / Password123!");
  console.log("👤 MEMBER: somchai@apexbank.com / Password123!");
  console.log("👤 MEMBER: manee@apexbank.com   / Password123!");
  console.log("-----------------------------------------\n");
}

main().catch(console.error);
