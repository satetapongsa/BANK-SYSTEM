// app/admin/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
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
  CheckCircle,
} from "lucide-react";
import ConfirmModal from "@/app/components/ConfirmModal";
import TransactionReceiptModal from "@/app/components/TransactionReceiptModal";

interface AdminMetrics {
  totalUsers: number;
  activeUsers: number;
  totalAccounts: number;
  activeAccounts: number;
  totalBalance: string;
  totalDeposits: string;
  totalWithdrawals: string;
  totalTransfers: string;
  todayDeposits: string;
  todayWithdrawals: string;
  todayTransfers: string;
  totalTransactionsCount: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [recentTxs, setRecentTxs] = useState<any[]>([]);
  const [recentAudits, setRecentAudits] = useState<any[]>([]);
  const [dbEngine, setDbEngine] = useState("LOCAL_ACID_ENGINE");

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

  const fetchOverview = async () => {
    try {
      const res = await fetch("/api/admin/overview");
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push("/login");
          return;
        }
      }
      const json = await res.json();
      if (json.success && json.data) {
        setMetrics(json.data.metrics);
        setRecentTxs(json.data.recentTransactions || []);
        setRecentAudits(json.data.recentAudits || []);
        setDbEngine(json.data.databaseEngine);
      }
    } catch (e) {
      console.error("Admin overview error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

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
      await fetchOverview();
    } catch (err: any) {
      setAdjError(err.message || "เกิดข้อผิดพลาดในการปรับปรุงยอด");
    } finally {
      setIsSubmittingAdj(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse py-6">
        <div className="h-10 w-64 bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-850 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-850/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950 text-purple-400 border border-purple-800/80 uppercase">
              Executive Console
            </span>
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-semibold">
              <Activity size={13} />
              <span>ระบบทำงานปกติ</span>
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight mt-1">
            ภาพรวมการบริหารการเงิน (Executive Dashboard)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            สถิติเรียลไทม์ ปริมาณเงินหมุนเวียนในระบบ และการควบคุมธุรกรรมระดับผู้บริหาร
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAdjOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition-all active:scale-[0.98]"
          >
            <Sliders size={15} />
            <span>ปรับปรุงยอดเงิน (Adjustment)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Vault Balance */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>ยอดสินทรัพย์รวมทั้งหมด</span>
            <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              <Layers size={16} />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-100 mt-3">
            ฿{Number(metrics?.totalBalance || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-cyan-400/90 font-mono mt-1">
            ใน {metrics?.activeAccounts} บัญชีที่ Active
          </p>
        </div>

        {/* Today Deposits */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>ยอดฝากเงินวันนี้</span>
            <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/60">
              <ArrowDownLeft size={16} />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400 mt-3">
            ฿{Number(metrics?.todayDeposits || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500 font-mono mt-1">
            ยอดสะสมทั้งหมด ฿{Number(metrics?.totalDeposits || 0).toLocaleString("th-TH")}
          </p>
        </div>

        {/* Today Withdrawals */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>ยอดถอนเงินวันนี้</span>
            <div className="p-2 rounded-xl bg-amber-950 text-amber-400 border border-amber-800/60">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-amber-400 mt-3">
            ฿{Number(metrics?.todayWithdrawals || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500 font-mono mt-1">
            ยอดสะสมทั้งหมด ฿{Number(metrics?.totalWithdrawals || 0).toLocaleString("th-TH")}
          </p>
        </div>

        {/* Today Transfers */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>ยอดโอนเงินวันนี้</span>
            <div className="p-2 rounded-xl bg-blue-950 text-blue-400 border border-blue-800/60">
              <ArrowLeftRight size={16} />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-blue-400 mt-3">
            ฿{Number(metrics?.todayTransfers || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500 font-mono mt-1">
            ยอดสะสมทั้งหมด ฿{Number(metrics?.totalTransfers || 0).toLocaleString("th-TH")}
          </p>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          href="/admin/users"
          className="p-5 rounded-2xl bg-slate-900/50 hover:bg-slate-850/60 border border-slate-800/80 transition-all flex items-center justify-between group"
        >
          <div>
            <span className="text-xs text-slate-400 font-medium">สมาชิกและสิทธิ์</span>
            <h3 className="text-lg font-bold text-slate-200 mt-1">
              จัดการสมาชิก ({metrics?.totalUsers} คน)
            </h3>
            <p className="text-[11px] text-cyan-400 mt-1 group-hover:underline">
              ดูรายชื่อ / ระงับบัญชี &rarr;
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-800 text-slate-300">
            <Users size={22} />
          </div>
        </Link>

        <Link
          href="/admin/accounts"
          className="p-5 rounded-2xl bg-slate-900/50 hover:bg-slate-850/60 border border-slate-800/80 transition-all flex items-center justify-between group"
        >
          <div>
            <span className="text-xs text-slate-400 font-medium">บัญชีเงินฝาก</span>
            <h3 className="text-lg font-bold text-slate-200 mt-1">
              จัดการบัญชีธนาคาร ({metrics?.totalAccounts} บัญชี)
            </h3>
            <p className="text-[11px] text-cyan-400 mt-1 group-hover:underline">
              ตรวจสอบยอด / ปรับสถานะ &rarr;
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-800 text-slate-300">
            <CreditCard size={22} />
          </div>
        </Link>

        <Link
          href="/admin/audit-logs"
          className="p-5 rounded-2xl bg-slate-900/50 hover:bg-slate-850/60 border border-slate-800/80 transition-all flex items-center justify-between group"
        >
          <div>
            <span className="text-xs text-slate-400 font-medium">Audit Trail</span>
            <h3 className="text-lg font-bold text-slate-200 mt-1">
              ประวัติการตรวจสอบ (Audit Logs)
            </h3>
            <p className="text-[11px] text-cyan-400 mt-1 group-hover:underline">
              ดูบันทึกกิจกรรมความปลอดภัย &rarr;
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-800 text-slate-300">
            <ShieldAlert size={22} />
          </div>
        </Link>
      </div>

      {/* Two Column Layout: Recent Transactions & Recent Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Activity size={16} className="text-cyan-400" />
              <span>ธุรกรรมล่าสุดในระบบ (Live Feed)</span>
            </h3>
            <Link
              href="/portal/transactions"
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300"
            >
              ดูทั้งหมด
            </Link>
          </div>

          <div className="divide-y divide-slate-850/80">
            {recentTxs.slice(0, 6).map((tx) => (
              <div
                key={tx.id}
                onClick={() => {
                  setLatestTx(tx);
                  setReceiptOpen(true);
                }}
                className="py-3 flex items-center justify-between hover:bg-slate-850/40 px-2 rounded-xl cursor-pointer transition-colors"
              >
                <div>
                  <p className="font-mono text-xs font-bold text-slate-200">
                    {tx.transaction_reference}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {tx.type} • {tx.from_account_number || "ธนาคาร"} &rarr;{" "}
                    {tx.to_account_number || "ภายนอก"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs font-bold text-slate-100">
                    ฿{Number(tx.amount).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                  </p>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit Logs */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <ShieldAlert size={16} className="text-purple-400" />
              <span>บันทึกความปลอดภัยล่าสุด (Audit Activity)</span>
            </h3>
            <Link
              href="/admin/audit-logs"
              className="text-xs font-bold text-purple-400 hover:text-purple-300"
            >
              ดูทั้งหมด
            </Link>
          </div>

          <div className="divide-y divide-slate-850/80">
            {recentAudits.slice(0, 6).map((log) => (
              <div key={log.id} className="py-3 px-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-purple-300">
                    {log.action}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(log.created_at).toLocaleTimeString("th-TH")}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Target: <span className="font-mono text-slate-300">{log.entity_id || log.entity_type}</span>
                  {log.reason && ` • เหตุผล: ${log.reason}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Adjustment Modal */}
      {adjOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100 mb-1">
              ปรับปรุงยอดเงินบัญชี (Administrative Adjustment)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              การปรับปรุงยอดเงินจำเป็นต้องระบุเหตุผลอย่างชัดเจนและจะถูกบันทึกลง Audit Trail
            </p>

            <div className="space-y-4">
              {/* Type: Credit vs Debit */}
              <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setAdjType("CREDIT")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    adjType === "CREDIT"
                      ? "bg-emerald-500 text-slate-950 font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  เพิ่มยอดเงิน (CREDIT)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjType("DEBIT")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    adjType === "DEBIT"
                      ? "bg-rose-500 text-white font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  หักยอดเงิน (DEBIT)
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  รหัสบัญชีเป้าหมาย (Account ID)
                </label>
                <input
                  type="number"
                  placeholder="เช่น 1 หรือ 2"
                  value={adjAccountId}
                  onChange={(e) => setAdjAccountId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  จำนวนเงิน (บาท)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="0.00"
                  value={adjAmount}
                  onChange={(e) => setAdjAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  เหตุผลในการปรับปรุงยอด (Compulsory Reason - ขั้นต่ำ 5 อักษร)
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="เช่น ชดเชยกรณีระบบขัดข้องตามคำสั่งผู้บริหารเลขที่..."
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              {adjError && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>{adjError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAdjOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  disabled={isSubmittingAdj}
                  onClick={handleExecuteAdjustment}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 disabled:opacity-50"
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
