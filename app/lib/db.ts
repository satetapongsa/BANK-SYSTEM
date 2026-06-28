// app/lib/db.ts
import { neon } from "@neondatabase/serverless";

/**
 * Neon Database connection wrapper.
 * This is prepared for linking your project with a serverless Postgres database on Neon.
 * 
 * Supply your connection string in the environment variables:
 * DATABASE_URL="postgresql://user:pass@ep-some-host.region.pooler.neon.tech/neondb?sslmode=require"
 */

const connectionString = process.env.DATABASE_URL || "";

// Neon HTTP query client (runs anywhere: Edge, Serverless, Node.js)
export const sql = connectionString ? neon(connectionString) : null;

/**
 * SQL Schema definition to initialize tables in your Neon Console.
 * 
 * Run the following statements in the SQL Editor of your Neon Dashboard:
 * 
 * -- 1. Create clients registry table
 * CREATE TABLE IF NOT EXISTS clients (
 *   id SERIAL PRIMARY KEY,
 *   name VARCHAR(255) NOT NULL,
 *   email VARCHAR(255) UNIQUE NOT NULL,
 *   phone VARCHAR(50) NOT NULL,
 *   address TEXT NOT NULL,
 *   branch_code VARCHAR(50) NOT NULL,
 *   account_number VARCHAR(10) UNIQUE NOT NULL,
 *   balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
 *   status VARCHAR(50) DEFAULT 'Active',
 *   region VARCHAR(255) NOT NULL
 * );
 * 
 * -- 2. Create transactions log table
 * CREATE TABLE IF NOT EXISTS transactions (
 *   id SERIAL PRIMARY KEY,
 *   sender_id INT,
 *   receiver_id INT,
 *   sender_account VARCHAR(50),
 *   receiver_account VARCHAR(50),
 *   amount NUMERIC(15, 2) NOT NULL,
 *   type VARCHAR(50) NOT NULL, -- 'Deposit', 'Withdraw', 'Transfer'
 *   description TEXT,
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 * );
 */

/** Check if database connection is available */
export function isDbConnected(): boolean {
  return !!sql;
}

/** 
 * Sample query handlers to query Neon Database if connected.
 * In a full integration, you can swap these in storage.ts to fetch from Neon Postgres.
 */
export async function fetchClientsFromNeon() {
  if (!sql) throw new Error("Neon Database not connected. Set DATABASE_URL env var.");
  try {
    const result = await sql`SELECT * FROM clients ORDER BY id ASC`;
    return result;
  } catch (error) {
    console.error("Neon DB query error:", error);
    throw error;
  }
}

export async function fetchTransactionsFromNeon() {
  if (!sql) throw new Error("Neon Database not connected. Set DATABASE_URL env var.");
  try {
    const result = await sql`SELECT * FROM transactions ORDER BY created_at DESC`;
    return result;
  } catch (error) {
    console.error("Neon DB query error:", error);
    throw error;
  }
}
