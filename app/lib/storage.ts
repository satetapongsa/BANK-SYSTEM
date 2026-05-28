// app/lib/storage.ts

/** Simple client‑side storage for the WAVY BANK demo.
 *  All data is kept in browser localStorage under the keys:
 *   - "wavy_bank_clients"
 *   - "wavy_bank_transactions"
 *   - "wavy_user_email" (simulated Google login)
 *   - "wavy_is_admin" (admin flag, already used)
 *
 *  The functions provide a tiny CRUD‑like API that mimics the Supabase calls
 *  used previously, so the rest of the code can stay almost unchanged.
 */

export type Client = {
  id: number;
  name: string;
  email: string;
  account_number: string;
  balance: number;
  status: string; // "Active" | "Blocked"
  region: string;
};

export type Transaction = {
  id: number;
  sender_id?: number;
  receiver_id?: number;
  sender_account?: string;
  receiver_account?: string;
  amount: number;
  type: string; // "Deposit" | "Transfer" | etc.
  description: string;
  created_at: string; // ISO string
  status?: string;
};

const CLIENTS_KEY = "wavy_bank_clients";
const TX_KEY = "wavy_bank_transactions";

/** Helper to safely parse JSON from localStorage */
function parse<T>(key: string): T | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    console.warn(`Failed to parse ${key}, resetting.`);
    localStorage.removeItem(key);
    return null;
  }
}

/** Helper to persist JSON */
function persist<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

/** Get all clients */
export function getClients(): Client[] {
  const data = parse<Client[]>(CLIENTS_KEY);
  if (!Array.isArray(data)) {
    // Corrupted data (e.g. a bare number stored instead of an array) – reset it.
    if (data !== null) localStorage.removeItem(CLIENTS_KEY);
    return [];
  }
  return data;
}

/** Save the full client list */
export function setClients(clients: Client[]) {
  persist(CLIENTS_KEY, clients);
}

/** Find a client by a predicate */
export function findClient(fn: (c: Client) => boolean): Client | undefined {
  const clients = getClients();
  if (!Array.isArray(clients)) {
    // Unexpected data – reset and return undefined
    localStorage.removeItem(CLIENTS_KEY);
    return undefined;
  }
  return clients.find(fn);
}

/** Update a client (partial) */
export function updateClient(id: number, updates: Partial<Client>) {
  const clients = getClients();
  const idx = clients.findIndex(c => c.id === id);
  if (idx === -1) return false;
  clients[idx] = { ...clients[idx], ...updates };
  setClients(clients);
  return true;
}

/** Delete a client (and optionally its transactions) */
export function deleteClient(id: number) {
  const clients = getClients().filter(c => c.id !== id);
  setClients(clients);
  // also delete related transactions
  const txs = getTransactions().filter(t => t.sender_id !== id && t.receiver_id !== id);
  setTransactions(txs);
}

/** Insert a new client */
export function insertClient(client: Omit<Client, "id">) {
  const clients = getClients();
  const newClient: Client = { id: Date.now() + Math.floor(Math.random() * 1000), ...client };
  clients.unshift(newClient);
  setClients(clients);
  return newClient;
}

/** Get all transactions */
export function getTransactions(): Transaction[] {
  const data = parse<Transaction[]>(TX_KEY);
  if (!Array.isArray(data)) {
    if (data !== null) localStorage.removeItem(TX_KEY);
    return [];
  }
  return data;
}

/** Save the full transaction list */
export function setTransactions(txs: Transaction[]) {
  persist(TX_KEY, txs);
}

/** Add a new transaction */
export function addTransaction(tx: Omit<Transaction, "id" | "created_at">) {
  const txs = getTransactions();
  const newTx: Transaction = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    created_at: new Date().toISOString(),
    ...tx,
  };
  txs.unshift(newTx);
  setTransactions(txs);
  return newTx;
}

/** Generate a random 12‑digit account number (mirroring previous format) */
export function generateAccountNumber(): string {
  return `101-0-${Math.floor(Math.random() * 89999 + 10000)}-${Math.floor(Math.random() * 9)}`;
}

/** Simulated Google login – stores a dummy email */
export function simulateGoogleLogin(): string {
  const dummy = `user${Math.random().toString(36).substring(2, 8)}@example.com`;
  localStorage.setItem("wavy_user_email", dummy);
  return dummy;
}

/** Get the simulated logged‑in user email */
export function getLoggedInUserEmail(): string | null {
  return localStorage.getItem("wavy_user_email");
}

/** Log out the simulated user */
export function logoutUser() {
  localStorage.removeItem("wavy_user_email");
}
