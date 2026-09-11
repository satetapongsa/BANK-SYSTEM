// app/portal/transactions/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { CreditCard, Search, ChevronLeft, ChevronRight } from "lucide-react";
import TransactionReceiptModal from "@/app/components/TransactionReceiptModal";

export default function TransactionsHistoryPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 15;

  const [selectedTx, setSelectedTx] = useState<any>(null);
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
      console.error(e);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="text-blue-600" size={24} />
            ประวัติธุรกรรม (Transaction History)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            รายการเคลื่อนไหวทางการเงินทั้งหมดในระบบที่ได้รับการบันทึกอย่างถูกต้อง
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Type Tabs */}
        <div className="flex overflow-x-auto pb-1 gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          {typeTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setTypeFilter(tab.key);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                typeFilter === tab.key
                  ? "bg-white text-blue-600 shadow-sm font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาเลขอ้างอิง..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200"
          >
            ค้นหา
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-5">เลขอ้างอิง / วันที่</th>
                <th className="py-3 px-4">ประเภท</th>
                <th className="py-3 px-4">ต้นทาง &rarr; ปลายทาง</th>
                <th className="py-3 px-4">บันทึก</th>
                <th className="py-3 px-4 text-right">จำนวนเงิน</th>
                <th className="py-3 px-5 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    กำลังโหลดประวัติธุรกรรม...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    ไม่พบรายการธุรกรรม
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
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-5">
                        <p className="font-mono font-bold text-slate-800">
                          {tx.transaction_reference}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {new Date(tx.created_at).toLocaleString("th-TH")}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            tx.type === "DEPOSIT"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : tx.type === "WITHDRAW"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : tx.type === "TRANSFER"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-purple-50 text-purple-700 border border-purple-200"
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                        {tx.from_account_number || "ธนาคาร"} &rarr;{" "}
                        <span className="text-blue-600 font-bold">
                          {tx.to_account_number || "เงินสด"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 max-w-[200px] truncate">
                        {tx.description || "-"}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`font-mono font-black text-sm ${
                            isDeposit ? "text-emerald-600" : "text-slate-900"
                          }`}
                        >
                          {isDeposit ? "+" : "-"}฿
                          {Number(tx.amount).toLocaleString("th-TH", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
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

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            แสดง {transactions.length} จาก {total} รายการ (หน้า {page}/{totalPages})
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <TransactionReceiptModal
        isOpen={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        transaction={selectedTx}
      />
    </div>
  );
}
