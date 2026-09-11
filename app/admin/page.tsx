// app/admin/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Layers,
  Database,
  Activity,
  Sliders,
  AlertCircle,
  RefreshCw,
  Search,
  CheckCircle,
  ClipboardList,
} from "lucide-react";
import ConfirmModal from "@/app/components/ConfirmModal";
import TransactionReceiptModal from "@/app/components/TransactionReceiptModal";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [dbData, setDbData] = useState<any>(null);
  const [activeDbTab, setActiveDbTab] = useState<"bank_accounts" | "users" | "transactions" | "audit_logs">("bank_accounts");
  const [dbSearch, setDbSearch] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Adjustment state
  const [adjOpen, setAdjOpen] = useState(false);
  const [adjAccountId, setAdjAccountId] = useState("");
  const [adjType, setAdjType] = useState<"CREDIT" | "DEBIT">("CREDIT");
  const [adjAmount, setAdjAmount] = useState("");
  const [adjReason, setAdjReason] = useState("");
  const [adjError, setAdjError] = useState<string | null>(null);
  const [isSubmittingAdj, setIsSubmittingAdj] = useState(false);

  // Receipt modal
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [latestTx, setLatestTx] = useState<any>(null);

  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      const [overviewRes, dbRes] = await Promise.all([
        fetch("/api/admin/overview"),
        fetch("/api/admin/database"),
      ]);

      if (!overviewRes.ok || !dbRes.ok) {
        if (overviewRes.status === 401 || overviewRes.status === 403) {
          router.push("/login");
          return;
        }
      }

      const overviewJson = await overviewRes.json();
      const dbJson = await dbRes.json();

      if (overviewJson.success) setMetrics(overviewJson.data.metrics);
      if (dbJson.success) setDbData(dbJson.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh poll every 5s if enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchData();
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleExecuteAdjustment = async () => {
    setAdjError(null);
    if (!adjAccountId || !adjAmount || Number(adjAmount) <= 0) {
      setAdjError("กรุณากรอกรหัสบัญชีและจำนวนเงินให้ถูกต้อง");
      return;
    }
    if (!adjReason || adjReason.trim().length < 5) {
      setAdjError("ต้องระบุเหตุผลในการปรับปรุงยอดเงินอย่างน้อย 5 ตัวอักษร");
      return;
    }

    setIsSubmittingAdj(true);
    try {
      const res = await fetch("/api/admin/adjustments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_id: Number(adjAccountId),
          type: adjType,
          amount: Number(adjAmount),
          reason: adjReason.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "ไม่สามารถปรับปรุงยอดเงินได้");
      }

      setAdjOpen(false);
      setAdjAmount("");
      setAdjReason("");
      setLatestTx(json.data.transaction);
      setReceiptOpen(true);
      await fetchData();
    } catch (err: any) {
      setAdjError(err.message || "เกิดข้อผิดพลาดในการปรับปรุงยอด");
    } finally {
      setIsSubmittingAdj(false);
    }
  };

  const getFilteredTableRows = () => {
    if (!dbData?.tables) return [];
    const rows: any[] = dbData.tables[activeDbTab] || [];
    if (!dbSearch.trim()) return rows;
    const q = dbSearch.toLowerCase().trim();
    return rows.filter((r) =>
      Object.values(r).some((val) =>
        String(val || "").toLowerCase().includes(q)
      )
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse py-6">
        <div className="h-8 w-64 bg-slate-200 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const filteredRows = getFilteredTableRows();

  return (
    <div className="space-y-8 animate-fade-in py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800 uppercase">
              👑 ผู้ดูแลระบบ (Admin Console)
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
              <Activity size={13} />
              <span>ระบบออนไลน์ (Real-time Live)</span>
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            แดชบอร์ดบริหารจัดการ & ตรวจสอบฐานข้อมูลสด
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ดูภาพรวมการเงิน จัดการสมาชิก และตรวจสอบทุกตารางในฐานข้อมูลแบบเรียลไทม์
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setAdjOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            <Sliders size={14} />
            <span>ปรับปรุงยอดเงิน</span>
          </button>
          <button
            onClick={fetchData}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs shadow-sm transition-all"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin text-blue-600" : ""} />
            <span>รีเฟรชข้อมูล</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Vault Balance */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>ยอดสินทรัพย์รวมทั้งหมด</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Layers size={16} />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-2">
            ฿{Number(metrics?.totalBalance || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-blue-600 font-bold mt-1">
            จาก {metrics?.activeAccounts} บัญชีที่เปิดใช้งาน
          </p>
        </div>

        {/* Today Deposits */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>ยอดเงินฝากวันนี้</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <ArrowDownLeft size={16} />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-600 mt-2">
            ฿{Number(metrics?.todayDeposits || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 font-mono mt-1">
            ยอดฝากสะสม ฿{Number(metrics?.totalDeposits || 0).toLocaleString("th-TH")}
          </p>
        </div>

        {/* Today Withdrawals */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>ยอดเงินถอนวันนี้</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-amber-600 mt-2">
            ฿{Number(metrics?.todayWithdrawals || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 font-mono mt-1">
            ยอดถอนสะสม ฿{Number(metrics?.totalWithdrawals || 0).toLocaleString("th-TH")}
          </p>
        </div>

        {/* Today Transfers */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>ยอดโอนเงินวันนี้</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <ArrowLeftRight size={16} />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-purple-600 mt-2">
            ฿{Number(metrics?.todayTransfers || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 font-mono mt-1">
            ยอดโอนสะสม ฿{Number(metrics?.totalTransfers || 0).toLocaleString("th-TH")}
          </p>
        </div>
      </div>

      {/* REAL-TIME LIVE DATABASE VIEWER SECTION */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Database size={20} className="text-blue-600" />
              <h2 className="text-lg font-black text-slate-900">
                ตัวตรวจสอบฐานข้อมูลสด (Live Database Inspector)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              ตรวจดูข้อมูลในตาราง PostgreSQL ได้ทันทีแบบเรียลไทม์ (อัปเดตอัตโนมัติทุก 5 วินาที)
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Auto-refresh toggle */}
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
              />
              <span>อัปเดตอัตโนมัติ (5s)</span>
            </label>

            {/* Search within DB */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาข้อมูลในตาราง..."
                value={dbSearch}
                onChange={(e) => setDbSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Database Table Selector Tabs */}
        <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-3 mb-4">
          <button
            onClick={() => setActiveDbTab("bank_accounts")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeDbTab === "bank_accounts"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
            }`}
          >
            <CreditCard size={15} />
            <span>bank_accounts ({dbData?.stats?.accountsCount || 0})</span>
          </button>

          <button
            onClick={() => setActiveDbTab("users")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeDbTab === "users"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
            }`}
          >
            <Users size={15} />
            <span>users ({dbData?.stats?.usersCount || 0})</span>
          </button>

          <button
            onClick={() => setActiveDbTab("transactions")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeDbTab === "transactions"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
            }`}
          >
            <ArrowLeftRight size={15} />
            <span>transactions ({dbData?.stats?.transactionsCount || 0})</span>
          </button>

          <button
            onClick={() => setActiveDbTab("audit_logs")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeDbTab === "audit_logs"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
            }`}
          >
            <ClipboardList size={15} />
            <span>audit_logs ({dbData?.stats?.auditLogsCount || 0})</span>
          </button>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              {activeDbTab === "bank_accounts" && (
                <tr>
                  <th className="py-3 px-4">id</th>
                  <th className="py-3 px-4">account_number</th>
                  <th className="py-3 px-4">user_id</th>
                  <th className="py-3 px-4">account_type</th>
                  <th className="py-3 px-4">currency</th>
                  <th className="py-3 px-4 text-right">balance (NUMERIC)</th>
                  <th className="py-3 px-4 text-center">status</th>
                  <th className="py-3 px-4">updated_at</th>
                </tr>
              )}
              {activeDbTab === "users" && (
                <tr>
                  <th className="py-3 px-4">id</th>
                  <th className="py-3 px-4">first_name last_name</th>
                  <th className="py-3 px-4">email</th>
                  <th className="py-3 px-4">phone</th>
                  <th className="py-3 px-4">role</th>
                  <th className="py-3 px-4">password_hash</th>
                  <th className="py-3 px-4 text-center">status</th>
                </tr>
              )}
              {activeDbTab === "transactions" && (
                <tr>
                  <th className="py-3 px-4">id</th>
                  <th className="py-3 px-4">transaction_reference</th>
                  <th className="py-3 px-4">type</th>
                  <th className="py-3 px-4">from_account</th>
                  <th className="py-3 px-4">to_account</th>
                  <th className="py-3 px-4 text-right">amount</th>
                  <th className="py-3 px-4 text-center">status</th>
                  <th className="py-3 px-4">description</th>
                </tr>
              )}
              {activeDbTab === "audit_logs" && (
                <tr>
                  <th className="py-3 px-4">id</th>
                  <th className="py-3 px-4">action</th>
                  <th className="py-3 px-4">actor_user_id</th>
                  <th className="py-3 px-4">entity_type</th>
                  <th className="py-3 px-4">entity_id</th>
                  <th className="py-3 px-4">reason</th>
                  <th className="py-3 px-4">created_at</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-sans">
                    ไม่พบข้อมูลแถวในตารางนี้
                  </td>
                </tr>
              ) : (
                filteredRows.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    {activeDbTab === "bank_accounts" && (
                      <>
                        <td className="py-2.5 px-4 font-bold text-slate-800">{row.id}</td>
                        <td className="py-2.5 px-4 font-bold text-blue-600">{row.account_number}</td>
                        <td className="py-2.5 px-4 text-slate-600">{row.user_id}</td>
                        <td className="py-2.5 px-4 text-slate-600">{row.account_type}</td>
                        <td className="py-2.5 px-4 text-slate-600">{row.currency}</td>
                        <td className="py-2.5 px-4 text-right font-black text-slate-900">
                          ฿{Number(row.balance).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              row.status === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-[10px] text-slate-400">
                          {new Date(row.updated_at).toLocaleTimeString("th-TH")}
                        </td>
                      </>
                    )}

                    {activeDbTab === "users" && (
                      <>
                        <td className="py-2.5 px-4 font-bold text-slate-800">{row.id}</td>
                        <td className="py-2.5 px-4 font-bold text-slate-800 font-sans">
                          {row.first_name} {row.last_name}
                        </td>
                        <td className="py-2.5 px-4 text-blue-600">{row.email}</td>
                        <td className="py-2.5 px-4 text-slate-600">{row.phone || "-"}</td>
                        <td className="py-2.5 px-4 font-bold text-purple-700">{row.role}</td>
                        <td className="py-2.5 px-4 text-[10px] text-slate-400">{row.password_hash}</td>
                        <td className="py-2.5 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              row.status === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                      </>
                    )}

                    {activeDbTab === "transactions" && (
                      <>
                        <td className="py-2.5 px-4 font-bold text-slate-800">{row.id}</td>
                        <td className="py-2.5 px-4 font-bold text-slate-800">
                          {row.transaction_reference}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-blue-700">{row.type}</td>
                        <td className="py-2.5 px-4 text-slate-500">{row.from_account_id || "NULL"}</td>
                        <td className="py-2.5 px-4 text-slate-500">{row.to_account_id || "NULL"}</td>
                        <td className="py-2.5 px-4 text-right font-black text-slate-900">
                          ฿{Number(row.amount).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {row.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-sans text-slate-600 truncate max-w-[150px]">
                          {row.description || "-"}
                        </td>
                      </>
                    )}

                    {activeDbTab === "audit_logs" && (
                      <>
                        <td className="py-2.5 px-4 font-bold text-slate-800">{row.id}</td>
                        <td className="py-2.5 px-4 font-bold text-purple-700">{row.action}</td>
                        <td className="py-2.5 px-4 text-slate-600">{row.actor_user_id || "System"}</td>
                        <td className="py-2.5 px-4 text-slate-500">{row.entity_type}</td>
                        <td className="py-2.5 px-4 font-bold text-slate-700">{row.entity_id || "-"}</td>
                        <td className="py-2.5 px-4 font-sans text-slate-600 truncate max-w-[180px]">
                          {row.reason || "-"}
                        </td>
                        <td className="py-2.5 px-4 text-[10px] text-slate-400">
                          {new Date(row.created_at).toLocaleString("th-TH")}
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjustment Modal */}
      {adjOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 mb-1">
              ปรับปรุงยอดเงินบัญชี (Administrative Adjustment)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              การปรับยอดจะถูกบันทึกประวัติลง Audit Trail อย่างเคร่งครัด
            </p>

            <div className="space-y-4">
              {/* Type: Credit vs Debit */}
              <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setAdjType("CREDIT")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    adjType === "CREDIT"
                      ? "bg-white text-emerald-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  เพิ่มยอดเงิน (CREDIT)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjType("DEBIT")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    adjType === "DEBIT"
                      ? "bg-white text-rose-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  หักยอดเงิน (DEBIT)
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  รหัสบัญชีเป้าหมาย (Account ID)
                </label>
                <input
                  type="number"
                  placeholder="เช่น 1 หรือ 2"
                  value={adjAccountId}
                  onChange={(e) => setAdjAccountId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  จำนวนเงิน (บาท)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="0.00"
                  value={adjAmount}
                  onChange={(e) => setAdjAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  เหตุผลในการปรับปรุงยอด (Compulsory Reason)
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="เช่น ชดเชยกรณีระบบขัดข้องตามคำสั่งผู้บริหาร..."
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              {adjError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="text-rose-600" />
                  <span>{adjError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setAdjOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  disabled={isSubmittingAdj}
                  onClick={handleExecuteAdjustment}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm disabled:opacity-50"
                >
                  {isSubmittingAdj ? "กำลังบันทึก..." : "ยืนยันการปรับปรุงยอด"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slip Modal */}
      <TransactionReceiptModal
        isOpen={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        transaction={latestTx}
      />
    </div>
  );
}
