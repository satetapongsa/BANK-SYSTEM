// app/transactions/page.tsx
"use client";
import { useEffect, useState } from "react";
import * as storage from "@/app/lib/storage";
import Card from "@/app/components/Card";
import Button from "@/app/components/Button";
import { Trash2 } from "lucide-react";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<storage.Transaction[]>([]);

  useEffect(() => {
    setTransactions(storage.getTransactions());
  }, []);

  const handleDelete = (id: number) => {
    // Simple delete by filtering out; storage doesn't have delete function for tx, just re-set list
    const newTxs = storage.getTransactions().filter(t => t.id !== id);
    storage.setTransactions(newTxs);
    setTransactions(newTxs);
  };

  return (
    <Card className="mt-6">
      <h2 className="text-2xl font-bold mb-4 text-glow-blue" style={{ color: "#f0f6fc" }}>Transactions</h2>
      {transactions.length === 0 ? (
        <p className="text-muted" style={{ color: "#8b949e" }}>No transactions found.</p>
      ) : (
        <table className="table-auto">
          <thead>
            <tr>
              <th className="px-4 py-2" style={{ color: "#484f58" }}>ID</th>
              <th className="px-4 py-2" style={{ color: "#484f58" }}>Time</th>
              <th className="px-4 py-2" style={{ color: "#484f58" }}>From</th>
              <th className="px-4 py-2" style={{ color: "#484f58" }}>To</th>
              <th className="px-4 py-2" style={{ color: "#484f58" }}>Amount</th>
              <th className="px-4 py-2" style={{ color: "#484f58" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-b border-white/5">
                <td className="px-4 py-2" style={{ color: "#8b949e" }}>{t.id}</td>
                <td className="px-4 py-2" style={{ color: "#8b949e" }}>{new Date(t.created_at).toLocaleString('th-TH')}</td>
                <td className="px-4 py-2" style={{ color: "#4f9cf9" }}>{t.sender_account ?? '-'}</td>
                <td className="px-4 py-2" style={{ color: "#4f9cf9" }}>{t.receiver_account ?? '-'}</td>
                <td className="px-4 py-2 font-bold" style={{ color: '#3fb950' }}>฿{Number(t.amount).toLocaleString()}</td>
                <td className="px-4 py-2 flex gap-2">
                  <Button onClick={() => handleDelete(t.id)} className="btn" style={{ background: "linear-gradient(135deg, #d73a49, #e55353)" }}>
                    <Trash2 size={14} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}
