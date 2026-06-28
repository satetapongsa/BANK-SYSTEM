// app/transactions/page.tsx
"use client";
import { useEffect, useState } from "react";
import * as storage from "@/app/lib/storage";
import Card from "@/app/components/Card";
import Button from "@/app/components/Button";
import { Trash2, ArrowLeftRight, Search } from "lucide-react";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<storage.Transaction[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = () => {
    const txs = storage.getTransactions().sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    setTransactions(txs);
  };

  const handleDelete = (id: number) => {
    if (!confirm("ยืนยันการลบบันทึกประวัติธุรกรรมรายการนี้อย่างถาวร? ยอดเงินคงเหลือของลูกค้าจะไม่ได้รับการอัปเดตคืนย้อนหลัง")) return;
    const newTxs = storage.getTransactions().filter((t) => t.id !== id);
    storage.setTransactions(newTxs);
    fetchTransactions();
  };

  const filtered = transactions.filter(
    (t) =>
      (t.sender_account ?? "").includes(search) ||
      (t.receiver_account ?? "").includes(search) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      (t.type ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-850 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <ArrowLeftRight className="text-blue-500" size={24} />
            บันทึกธุรกรรมทั้งหมดในระบบ (Transactions Log)
          </h1>
          <p className="text-xs font-semibold text-slate-400 mt-1">
            รายงานประวัติการ ฝากเงิน ถอนเงิน และโอนเงินของทุกบัญชีลูกค้าใน WAVY BANK ({transactions.length} รายการ)
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
          <Search size={16} />
        </div>
        <input
          type="text"
          placeholder="ค้นหาข้อมูลธุรกรรมด้วย เลขที่บัญชี, ประเภทธุรกรรม (Deposit/Withdraw/Transfer) หรือ คำอธิบาย..."
          className="bank-input pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Transactions Table Card */}
      <Card noPadding className="overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="flex flex-col items-center justify-center gap-2">
              <ArrowLeftRight size={40} className="text-slate-650" />
              <p className="text-sm font-semibold text-slate-500">
                {search ? "ไม่พบรายการประวัติธุรกรรมตรงกับที่ค้นหา" : "ยังไม่มีบันทึกรายการธุรกรรมภายในระบบธนาคาร"}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800">
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">วัน-เวลาทำธุรกรรม</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">บัญชีต้นทาง (From)</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">บัญชีปลายทาง (To)</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">ประเภท</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">รายละเอียดอ้างอิง (Description)</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">จำนวนเงิน (บาท)</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {filtered.map((t) => (
                  <tr key={t.id} className="bank-table-row">
                    <td className="px-6 py-4 text-xs font-semibold text-slate-400 whitespace-nowrap">
                      {new Date(t.created_at).toLocaleString("th-TH")}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-300">{t.sender_account ?? "—"}</td>
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-300">{t.receiver_account ?? "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        t.type === "Deposit"
                          ? "bg-emerald-955/40 text-emerald-450 border-emerald-900/40"
                          : t.type === "Withdraw"
                          ? "bg-rose-955/40 text-rose-450 border-rose-900/40"
                          : "bg-blue-955/40 text-blue-400 border-blue-900/40"
                      }`}>
                        {t.type === "Deposit" ? "ฝากเงิน" : t.type === "Withdraw" ? "ถอนเงิน" : "โอนเงิน"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-400 max-w-[200px] truncate" title={t.description}>
                      {t.description || "—"}
                    </td>
                    <td className={`px-6 py-4 text-sm font-bold text-right ${
                      t.type === "Deposit" ? "text-emerald-400" : t.type === "Withdraw" ? "text-rose-450" : "text-blue-400"
                    } whitespace-nowrap`}>
                      {t.type === "Withdraw" ? "-" : "+"}฿{Number(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button
                        variant="danger"
                        size="sm"
                        iconOnly
                        onClick={() => handleDelete(t.id)}
                        className="!p-1.5"
                        title="ลบธุรกรรม"
                      >
                        <Trash2 size={13} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
