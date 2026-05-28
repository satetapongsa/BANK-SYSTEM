// app/overview/page.tsx
"use client";

import { useEffect, useState } from "react";
import * as storage from "@/app/lib/storage";
import { ArrowUpDown, Users, TrendingUp } from "lucide-react";

// Types for safety – reuse definitions from storage
export type Client = storage.Client;
export type Transaction = storage.Transaction;

export default function ExecutiveOverview() {
  const [clients, setClients] = useState<Client[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load data from local storage (client‑side mock DB)
    const cl = storage.getClients();
    const txAll = storage.getTransactions();
    // Show the latest 5 txs, newest first
    const recent = txAll
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
    setClients(cl);
    setTransactions(recent);
    setLoading(false);
  }, []);

  const totalAssets = clients.reduce((sum, c) => sum + Number(c.balance), 0);

  // Simple loading fallback – a subtle shimmer
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: "#080c14" }}>
        <div className="text-gray-400 animate-pulse">Loading dashboard…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10" style={{ background: "#080c14" }}>
      {/* Background grid – subtle animated pattern */}
      <div className="grid-bg absolute inset-0 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto p-5 space-y-8">
        {/* Header */}
        <h1 className="text-4xl font-extrabold text-glow-blue" style={{ color: "#f0f6fc" }}>
          Executive Dashboard
        </h1>

        {/* KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Assets */}
          <div className="glass rounded-2xl p-6 flex flex-col">
            <p className="text-xs font-bold tracking-widest" style={{ color: "#484f58" }}>
              TOTAL ASSETS
            </p>
            <p className="text-3xl font-black mt-2" style={{ color: "#4f9cf9" }}>
              ฿{totalAssets.toLocaleString()}
            </p>
            <ArrowUpDown className="mt-3 w-5 h-5 text-gray-400" />
          </div>

          {/* Total Clients */}
          <div className="glass rounded-2xl p-6 flex flex-col">
            <p className="text-xs font-bold tracking-widest" style={{ color: "#484f58" }}>
              TOTAL CLIENTS
            </p>
            <p className="text-3xl font-black mt-2" style={{ color: "#4f9cf9" }}>
              {clients.length}
            </p>
            <Users className="mt-3 w-5 h-5 text-gray-400" />
          </div>

          {/* Recent Transactions */}
          <div className="glass rounded-2xl p-6 flex flex-col">
            <p className="text-xs font-bold tracking-widest" style={{ color: "#484f58" }}>
              RECENT TX
            </p>
            <p className="text-3xl font-black mt-2" style={{ color: "#4f9cf9" }}>
              {transactions.length}
            </p>
            <TrendingUp className="mt-3 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Transactions Table */}
        <section className="space-y-4">
          <h2 className="text-xl font-black text-glow-blue" style={{ color: "#f0f6fc" }}>
            Recent Transactions
          </h2>
          <div className="glass rounded-2xl overflow-hidden">
            <table className="w-full table-auto">
              <thead className="bg-gray-800/30">
                <tr>
                  {['Time', 'From', 'To', 'Amount'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2 text-left text-xs font-bold tracking-widest"
                      style={{ color: "#484f58" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b border-white/5">
                    <td className="px-4 py-2 text-xs" style={{ color: "#8b949e" }}>
                      {new Date(t.created_at).toLocaleString('th-TH')}
                    </td>
                    <td className="px-4 py-2 text-xs font-mono" style={{ color: "#4f9cf9" }}>
                      {t.sender_account ?? '-'}
                    </td>
                    <td className="px-4 py-2 text-xs font-mono" style={{ color: "#4f9cf9" }}>
                      {t.receiver_account ?? '-'}
                    </td>
                    <td className="px-4 py-2 font-bold" style={{ color: '#3fb950' }}>
                      ฿{Number(t.amount).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm" style={{ color: "#484f58" }}>
                      No recent transactions
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
