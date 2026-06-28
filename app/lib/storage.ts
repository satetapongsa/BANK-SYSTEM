// app/lib/storage.ts

/** Simple client‑side storage for the WAVY BANK demo.
 *  All data is kept in browser localStorage under the keys:
 *   - "wavy_bank_clients"
 *   - "wavy_bank_transactions"
 *   - "wavy_user_email" (simulated Google login)
 *   - "wavy_is_admin" (admin flag, already used)
 */

export type Client = {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  branch_code: string;
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
  type: string; // "Deposit" | "Transfer" | "Withdraw"
  description: string;
  created_at: string; // ISO string
  status?: string;
};

const CLIENTS_KEY = "wavy_bank_clients";
const TX_KEY = "wavy_bank_transactions";

/** Helper to safely parse JSON from localStorage */
function parse<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
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
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

// Helper to translate Thai names to English handles for email addresses
function transliterateToEng(thaiName: string): string {
  const map: Record<string, string> = {
    "สมชาย": "somchai", "สมหญิง": "somying", "เกียรติศักดิ์": "kiatisak", "นงนุช": "nongnuch", "ประเสริฐ": "prasert",
    "อรทัย": "orathai", "วิชัย": "wichai", "ศิริพร": "siriporn", "สุรพล": "surapol", "พัชรา": "patchara",
    "ธนากร": "thanakorn", "กนกวรรณ": "kanokwan", "อภิชาติ": "apichat", "วรรณภา": "wannapha", "มานพ": "manop",
    "ปิยะนุช": "piyanuch", "ชาญชัย": "chanchai", "วลัยพร": "walaiporn", "ธีรพล": "theerapol", "รุ่งนภา": "rungnapa",
    "ศักดิ์ชาย": "sakchai", "อัจฉรา": "atchara", "จรูญ": "jaroon", "สุนิสา": "sunisa", "ยุทธนา": "yuthana",
    "รุ่งทิพย์": "rungthip", "นเรศ": "nares", "พรทิพย์": "pornthip", "บัญชา": "bancha", "วาสนา": "wasana",
    "นพดล": "noppadol", "จิตรา": "jittra", "สุรชัย": "surachai", "มยุรี": "mayuree", "สุพจน์": "supot",
    "นารี": "naree", "ประสิทธิ์": "prasit", "กิตติมา": "kittima", "เอกชัย": "ekachai", "สมศรี": "somsri",
    "โกศล": "kosol", "อัญชลี": "anchalee", "พิเชษฐ์": "pichet", "จุฑารัตน์": "jutharat", "กอบชัย": "kobchai",
    "รัชนี": "ratchanee", "ปรีชา": "preecha", "สลักจิต": "salakjit", "วรวุฒิ": "worawut", "ศศิธร": "sasithorn"
  };
  return map[thaiName] || "user";
}

/** Generates Owner account and exactly 50 distinct clients with varying details */
function generate50Clients(): Client[] {
  const clients: Client[] = [];

  // 1. Add Owner/Admin account at index 0 (ID: 777)
  clients.push({
    id: 777,
    name: "ผู้ดูแลระบบ WAVY BANK (Owner)",
    email: "owner@wavybank.com",
    phone: "089-777-7777",
    address: "สำนักงานใหญ่ WAVY BANK กรุงเทพมหานคร",
    branch_code: "101",
    account_number: "1017777777",
    balance: 100000000.00, // 100,000,000.00 Baht
    status: "Active",
    region: "สำนักงานใหญ่ (ปทุมวัน)",
  });

  const firstNames = [
    "สมชาย", "สมหญิง", "เกียรติศักดิ์", "นงนุช", "ประเสริฐ", "อรทัย", "วิชัย", "ศิริพร", "สุรพล", "พัชรา",
    "ธนากร", "กนกวรรณ", "อภิชาติ", "วรรณภา", "มานพ", "ปิยะนุช", "ชาญชัย", "วลัยพร", "ธีรพล", "รุ่งนภา",
    "ศักดิ์ชาย", "อัจฉรา", "จรูญ", "สุนิสา", "ยุทธนา", "รุ่งทิพย์", "นเรศ", "พรทิพย์", "บัญชา", "วาสนา",
    "นพดล", "จิตรา", "สุรชัย", "มยุรี", "สุพจน์", "นารี", "ประสิทธิ์", "กิตติมา", "เอกชัย", "สมศรี",
    "โกศล", "อัญชลี", "พิเชษฐ์", "จุฑารัตน์", "กอบชัย", "รัชนี", "ปรีชา", "สลักจิต", "วรวุฒิ", "ศศิธร"
  ];
  const lastNames = [
    "รักษ์ดี", "ดีประเสริฐ", "สุวรรณรัตน์", "วงศ์วิจิตร", "พงษ์พานิช", "ศรีสุข", "เจริญพร", "นิลเขียว", "เลิศวิไล", "แก้วเจริญ",
    "แสนดี", "มีทอง", "สุขสำราญ", "วงศ์ศิริ", "เจริญสุข", "แสงสว่าง", "เกียรติบัณฑิต", "พัฒนพงศ์", "นามสกุลดี", "บูรณศิลป์",
    "รัตนวิชัย", "พงษ์สุวรรณ", "ชัยประสิทธิ์", "ธนะพัฒน์", "สมบูรณ์ดี", "นราภิรมย์", "สุขใจ", "เรืองรอง", "มิ่งขวัญ", "วรเดช",
    "ชนะภัย", "ปิ่นแก้ว", "เกษมสันต์", "อภิรักษ์", "อนันตศิลป์", "เชี่ยวชาญ", "วังสุวรรณ", "แสนสบาย", "เลิศพัฒนา", "รุ่งโรจน์",
    "ประกายแสง", "โยธิน", "ไพโรจน์", "บุญช่วย", "ทรัพย์มั่นคง", "พรสวัสดิ์", "ศิริวัฒน์", "อัครเดช", "กิตติคุณ", "ธรรมรัตน์"
  ];
  const locations = [
    { province: "กรุงเทพมหานคร", region: "กรุงเทพมหานคร", branch: "สำนักงานใหญ่ (ปทุมวัน)", branchCode: "101" },
    { province: "เชียงใหม่", region: "ภาคเหนือ", branch: "สาขาถนนท่าแพ", branchCode: "202" },
    { province: "ภูเก็ต", region: "ภาคใต้", branch: "สาขาหาดป่าตอง", branchCode: "303" },
    { province: "ชลบุรี", region: "ภาคตะวันออก", branch: "สาขาพัทยาใต้", branchCode: "404" },
    { province: "ขอนแก่น", region: "ภาคตะวันออกเฉียงเหนือ", branch: "สาขาถนนมิตรภาพ", branchCode: "505" },
  ];
  const streets = ["ถนนสุขุมวิท", "ถนนพหลโยธิน", "ถนนเพชรเกษม", "ถนนมิตรภาพ", "ถนนราชดำเนิน", "ถนนสาทร", "ถนนพระราม 9"];

  for (let i = 0; i < 50; i++) {
    const fn = firstNames[i];
    const ln = lastNames[i];
    const name = `${fn} ${ln}`;
    const engFn = transliterateToEng(fn);
    const engLn = transliterateToEng(ln);
    const email = `${engFn}.${engLn}@wavybank.com`;
    const phone = `0${80 + (i % 3) * 6 + (i % 2) * 5}-${Math.floor(100 + i * 17)}-${Math.floor(1000 + i * 133)}`;
    const loc = locations[i % locations.length];
    const street = streets[i % streets.length];
    const houseNo = `${12 + i}/${Math.floor(3 + i / 4)}`;
    const address = `บ้านเลขที่ ${houseNo} ${street} ต.ในเมือง อ.เมือง จ.${loc.province} ${10000 + i * 73}`;
    
    // Generate unique 10-digit account number starting with a branch code prefix
    const accNum = `${loc.branchCode}${Math.floor(1000000 + i * 15309)}`;
    const balance = Math.floor(5000 + Math.pow(i, 2.5) * 80 + (i % 7) * 2300);

    clients.push({
      id: 1000 + i,
      name,
      email,
      phone,
      address,
      branch_code: loc.branchCode,
      account_number: accNum,
      balance,
      status: "Active",
      region: loc.branch,
    });
  }
  return clients;
}

/** Get all clients */
export function getClients(): Client[] {
  const data = parse<Client[]>(CLIENTS_KEY);
  if (!Array.isArray(data) || data.length === 0) {
    if (typeof window !== "undefined") {
      const seeded = generate50Clients();
      setClients(seeded);
      return seeded;
    }
    return [];
  }
  return data;
}

/** Save the full client list */
export function setClients(clients: Client[]) {
  persist(CLIENTS_KEY, clients);
}

/** Get the Owner's Bank Account specifically */
export function getOwnerAccount(): Client | undefined {
  return findClient(c => c.account_number === "1017777777");
}

/** Find a client by a predicate */
export function findClient(fn: (c: Client) => boolean): Client | undefined {
  const clients = getClients();
  if (!Array.isArray(clients)) {
    if (typeof window !== "undefined") localStorage.removeItem(CLIENTS_KEY);
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
    if (typeof window !== "undefined" && data !== null) localStorage.removeItem(TX_KEY);
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

/** Generate a random unique 10‑digit account number */
export function generateAccountNumber(): string {
  let num = "";
  for (let i = 0; i < 10; i++) {
    num += Math.floor(Math.random() * 10);
  }
  // Check uniqueness
  const clients = getClients();
  const exists = clients.some(c => c.account_number === num);
  if (exists) return generateAccountNumber();
  return num;
}

/** Simulated Google login – stores a dummy email */
export function simulateGoogleLogin(): string {
  const dummy = `user${Math.random().toString(36).substring(2, 8)}@example.com`;
  if (typeof window !== "undefined") {
    localStorage.setItem("wavy_user_email", dummy);
  }
  return dummy;
}

/** Get the simulated logged‑in user email */
export function getLoggedInUserEmail(): string | null {
  return parse<string>("wavy_user_email") || null;
}

/** Log out the simulated user */
export function logoutUser() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("wavy_user_email");
  }
}
