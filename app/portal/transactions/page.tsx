// app/portal/transactions/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import {
  CreditCard,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";
import TransactionReceiptModal from "@/app/components/TransactionReceiptModal";

interface Transaction {
  id: number;
  transaction_reference: string;
  type: string;
  status: string;
  amount: string;
  description: string;
  created_at: string;
  from_account_number?: string | null;
  to_account_number?: string | null;
}

export default function TransactionsHistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 15;

  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * limit;
      let url = `/api/transactions?limit=${limit}&offset=${offset}`;
      if (typeFilter !== "ALL") url += `&type=${typeFilter}`;
      if (searchTerm.trim()) url += `&reference=${encodeURIComponent(searchTerm.trim())}`;

      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setTransactions(json.data.transactions || []);
        setTotal(json.data.total || 0);
      }
    } catch (e) {
      console.error("Failed to load transactions", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [typeFilter, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const totalPages = Math.ceil(total / limit) || 1;

  const typeTabs = [
    { key: "ALL", label: "ทั้งหมด" },
    { key: "TRANSFER", label: "โอนเงิน" },
    { key: "DEPOSIT", label: "ฝากเงิน" },
    { key: "WITHDRAW", label: "ถอนเงิน" },
    { key: "ADJUSTMENT", label: "ปรับปรุงยอด" },
  ];

  return (
    <div className="space-y-6 animate-fade-in py-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-850/80 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <CreditCard className="text-cyan-400" size={24} />
            ประวัติธุรกรรม (Transaction History)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            รายการเคลื่อนไหวทางการเงินทั้งหมดในระบบที่ผ่านการรับรองความถูกต้อง
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Type Tabs */}
        <div className="flex overflow-x-auto pb-1 gap-1.5 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-850">
          {typeTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setTypeFilter(tab.key);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                typeFilter === tab.key
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="ค้นหาตามเลขอ้างอิง..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800 transition-colors"
          >
            ค้นหา
          </button>
        </form>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-5">เลขอ้างอิง / วันที่</th>
                <th className="py-3.5 px-4">ประเภท</th>
                <th className="py-3.5 px-4">บัญชีต้นทาง &rarr; ปลายทาง</th>
                <th className="py-3.5 px-4">บันทึก</th>
                <th className="py-3.5 px-4 text-right">จำนวนเงิน</th>
                <th className="py-3.5 px-5 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/80">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    กำลังโหลดข้อมูลธุรกรรม...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    ไม่พบรายการธุรกรรมที่ตรงตามเงื่อนไข
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isDeposit = tx.type === "DEPOSIT";
                  return (
                    <tr
                      key={tx.id}
                      onClick={() => {
                        setSelectedTx(tx);
                        setReceiptOpen(true);
                      }}
                      className="hover:bg-slate-850/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-5">
                        <p className="font-mono font-bold text-slate-200">
                          {tx.transaction_reference}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {new Date(tx.created_at).toLocaleString("th-TH")}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono ${
                            tx.type === "DEPOSIT"
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60"
                              : tx.type === "WITHDRAW"
                              ? "bg-amber-950 text-amber-400 border border-amber-800/60"
                              : tx.type === "TRANSFER"
                              ? "bg-cyan-950 text-cyan-400 border border-cyan-800/60"
                              : "bg-purple-950 text-purple-400 border border-purple-800/60"
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                        {tx.from_account_number || "ธนาคาร / สาขา"} &rarr;{" "}
                        <span className="text-cyan-400 font-semibold">
                          {tx.to_account_number || "เงินสด / ถอน"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 max-w-[200px] truncate">
                        {tx.description || "-"}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`font-mono font-bold text-sm ${
                            isDeposit ? "text-emerald-400" : "text-slate-100"
                          }`}
                        >
                          {isDeposit ? "+" : "-"}฿
                          {Number(tx.amount).toLocaleString("th-TH", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            แสดง {transactions.length} จากทั้งหมด {total} รายการ (หน้า {page}/{totalPages})
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:text-slate-100 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:text-slate-100 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Slip Modal */}
      <TransactionReceiptModal
        isOpen={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        transaction={selectedTx}
      />
    </div>
  );
}
