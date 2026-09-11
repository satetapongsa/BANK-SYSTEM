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
  Cloud,
  Check,
  Copy,
  ExternalLink,
  Cpu,
  Server,
  Zap,
} from "lucide-react";
import ConfirmModal from "@/app/components/ConfirmModal";
import TransactionReceiptModal from "@/app/components/TransactionReceiptModal";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [dbData, setDbData] = useState<any>(null);
  const [activeDbTab, setActiveDbTab] = useState<"bank_accounts" | "users" | "transactions" | "audit_logs" | "neon_cloud">("bank_accounts");
  const [dbSearch, setDbSearch] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Neon DB state
  const [neonData, setNeonData] = useState<any>(null);
  const [isTestingNeon, setIsTestingNeon] = useState(false);
  const [isMigratingNeon, setIsMigratingNeon] = useState(false);
  const [neonMessage, setNeonMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

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
      const [overviewRes, dbRes, neonRes] = await Promise.all([
        fetch("/api/admin/overview"),
        fetch("/api/admin/database"),
        fetch("/api/admin/neon"),
      ]);

      if (!overviewRes.ok || !dbRes.ok) {
        if (overviewRes.status === 401 || overviewRes.status === 403) {
          router.push("/login");
          return;
        }
      }

      const overviewJson = await overviewRes.json();
      const dbJson = await dbRes.json();
      const neonJson = await neonRes.json().catch(() => ({}));

      if (overviewJson.success) setMetrics(overviewJson.data.metrics);
      if (dbJson.success) setDbData(dbJson.data);
      if (neonJson.success) setNeonData(neonJson.data);
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

  const handleTestNeon = async () => {
    setIsTestingNeon(true);
    setNeonMessage(null);
    try {
      const res = await fetch("/api/admin/neon");
      const json = await res.json();
      if (json.success) {
        setNeonData(json.data);
        if (json.data.connectionStatus === "CONNECTED") {
          setNeonMessage({ text: `เชื่อมต่อ Neon สำเร็จ! Latency: ${json.data.latencyMs}ms`, type: "success" });
        } else if (json.data.connectionStatus === "NOT_CONFIGURED") {
          setNeonMessage({ text: "ยังไม่ได้ระบุ DATABASE_URL ใน .env.local (กำลังใช้งาน Local ACID Engine)", type: "error" });
        } else {
          setNeonMessage({ text: `การเชื่อมต่อผิดพลาด: ${json.data.connectionError}`, type: "error" });
        }
      }
    } catch (err: any) {
      setNeonMessage({ text: err.message, type: "error" });
    } finally {
      setIsTestingNeon(false);
    }
  };

  const handleMigrateNeon = async () => {
    setIsMigratingNeon(true);
    setNeonMessage(null);
    try {
      const res = await fetch("/api/admin/neon", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setNeonMessage({ text: json.data.message || "ติดตั้ง Schema สำเร็จ!", type: "success" });
        await fetchData();
      } else {
        setNeonMessage({ text: json.error?.message || "Migrate ล้มเหลว", type: "error" });
      }
    } catch (err: any) {
      setNeonMessage({ text: err.message, type: "error" });
    } finally {
      setIsMigratingNeon(false);
    }
  };

  const handleCopySql = () => {
    if (!neonData?.schemaContent) return;
    navigator.clipboard.writeText(neonData.schemaContent);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

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
    if (!dbData?.tables || activeDbTab === "neon_cloud") return [];
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
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const filteredRows = getFilteredTableRows();

  return (
    <div className="space-y-8 animate-fade-in py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 uppercase">
              👑 ผู้ดูแลระบบ (Admin Console)
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
              <Activity size={13} />
              <span>ระบบออนไลน์ (Real-time Live)</span>
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            แดชบอร์ดบริหารจัดการ & ตรวจสอบฐานข้อมูลสด
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
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
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-sm transition-all"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin text-blue-600 dark:text-blue-400" : ""} />
            <span>รีเฟรชข้อมูล</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">ยอดเงินฝากรวมทั้งระบบ</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <CreditCard size={18} />
            </div>
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
            ฿{Number(metrics?.totalBalance || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
            <span>{metrics?.activeAccounts || 0} บัญชีใช้งานอยู่</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">ACID Validated</span>
          </div>
        </div>

        {/* Total Users */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">สมาชิกในระบบ (Users)</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Users size={18} />
            </div>
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
            {metrics?.totalUsers || 0} <span className="text-xs font-sans text-slate-500 dark:text-slate-400 font-normal">บัญชี</span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{metrics?.activeUsers || 0} ACTIVE</span>
            <span>•</span>
            <span>0 ถูกระงับ</span>
          </div>
        </div>

        {/* Today Deposits */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">ยอดฝากเงินวันนี้</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <ArrowDownLeft size={18} />
            </div>
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
            +฿{Number(metrics?.todayDeposits || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            ยอดฝากสะสมทั้งหมด ฿{Number(metrics?.totalDeposits || 0).toLocaleString("th-TH")}
          </div>
        </div>

        {/* Today Transfers */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">ยอดโอนเงินวันนี้</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <ArrowLeftRight size={18} />
            </div>
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-indigo-600 dark:text-indigo-400">
            ฿{Number(metrics?.todayTransfers || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            ธุรกรรมทั้งหมด {metrics?.totalTransactionsCount || 0} รายการ
          </div>
        </div>
      </div>

      {/* Real-time Database Inspector Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Database className="text-blue-600 dark:text-blue-400" size={20} />
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Live Database Inspector (ตรวจสอบฐานข้อมูลแบบเรียลไทม์)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                {dbData?.engine || "LOCAL_ACID_ENGINE"}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              ดึงข้อมูลจากตารางจริงโดยตรงพร้อมอัปเดตอัตโนมัติทุก 5 วินาที
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search filter for table */}
            {activeDbTab !== "neon_cloud" && (
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="ค้นหาข้อมูลในตาราง..."
                  value={dbSearch}
                  onChange={(e) => setDbSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            {/* Auto refresh toggle */}
            <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Auto-refresh (5s)</span>
            </label>
          </div>
        </div>

        {/* Database Tabs */}
        <div className="flex flex-wrap gap-2 mb-5">
          <button
            onClick={() => setActiveDbTab("bank_accounts")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeDbTab === "bank_accounts"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700"
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
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700"
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
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700"
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
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700"
            }`}
          >
            <ClipboardList size={15} />
            <span>audit_logs ({dbData?.stats?.auditLogsCount || 0})</span>
          </button>

          {/* Neon Cloud Tab */}
          <button
            onClick={() => setActiveDbTab("neon_cloud")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeDbTab === "neon_cloud"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
            }`}
          >
            <Cloud size={15} />
            <span>Neon PostgreSQL Cloud Architecture ⚡</span>
          </button>
        </div>

        {/* Tab Content: Neon Cloud Panel */}
        {activeDbTab === "neon_cloud" ? (
          <div className="space-y-6">
            {/* Status Notification */}
            {neonMessage && (
              <div
                className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 ${
                  neonMessage.type === "success"
                    ? "bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
                    : "bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200"
                }`}
              >
                {neonMessage.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                <span className="font-medium">{neonMessage.text}</span>
              </div>
            )}

            {/* Connection Overview Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">สถานะการเชื่อมต่อ Neon</span>
                <div className="flex items-center gap-2 mt-1.5">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      neonData?.connectionStatus === "CONNECTED"
                        ? "bg-emerald-500 animate-pulse"
                        : "bg-amber-500"
                    }`}
                  />
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {neonData?.connectionStatus === "CONNECTED"
                      ? "เชื่อมต่อสำเร็จ (Connected)"
                      : neonData?.connectionStatus === "ERROR"
                      ? "การเชื่อมต่อผิดพลาด"
                      : "รอการกำหนดค่า (Not Configured)"}
                  </span>
                </div>
                {neonData?.latencyMs && (
                  <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                    Latency: {neonData.latencyMs} ms
                  </p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">เครื่องยนต์ฐานข้อมูลที่ทำงาน</span>
                <div className="flex items-center gap-2 mt-1.5">
                  <Cpu size={16} className="text-blue-600 dark:text-blue-400" />
                  <span className="font-mono text-sm font-black text-slate-900 dark:text-white">
                    {neonData?.engine || "LOCAL_ACID_ENGINE"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {neonData?.engine === "NEON_POSTGRESQL"
                    ? "รันบน Serverless PostgreSQL Pool"
                    : "รันบน Re-entrant Fallback ACID Mutex"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">URL ฐานข้อมูล (Masked)</span>
                <p className="font-mono text-xs text-slate-700 dark:text-slate-300 mt-1.5 truncate">
                  {neonData?.maskedUrl || "DATABASE_URL not set in .env.local"}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">ตั้งค่าใน .env.local เพื่อเปิดใช้งาน Neon ทันที</p>
              </div>
            </div>

            {/* Neon Table Schema Status */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">
                โครงสร้าง 6 ตารางมาตรฐาน (DDL Schema Verification)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                {(neonData?.expectedTables || ["users", "bank_accounts", "transactions", "audit_logs", "sessions", "notifications"]).map((tbl: string) => {
                  const isFound = neonData?.detectedTables?.includes(tbl);
                  return (
                    <div
                      key={tbl}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isFound
                          ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <div className="flex items-center justify-center mb-1">
                        {isFound ? (
                          <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                        )}
                      </div>
                      <p className="font-mono text-xs font-bold">{tbl}</p>
                      <span className="text-[10px] text-slate-400">
                        {isFound ? "Ready on Neon" : "Ready in Schema"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Neon Management Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleTestNeon}
                disabled={isTestingNeon}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Zap size={14} />
                <span>{isTestingNeon ? "กำลังทดสอบ..." : "ทดสอบการเชื่อมต่อ Neon"}</span>
              </button>

              <button
                type="button"
                onClick={handleMigrateNeon}
                disabled={isMigratingNeon || !neonData?.isConfigured}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Server size={14} />
                <span>{isMigratingNeon ? "กำลังติดตั้ง..." : "⚡ รัน Migrate & Seed บน Neon (1-Click)"}</span>
              </button>

              <button
                type="button"
                onClick={handleCopySql}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all flex items-center gap-2"
              >
                {copiedSql ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copiedSql ? "คัดลอก SQL แล้ว!" : "คัดลอกโค้ด Schema DDL (schema.sql)"}</span>
              </button>
            </div>

            {/* Instructions Guide */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs space-y-1.5">
              <p className="font-bold flex items-center gap-1.5">
                <AlertCircle size={14} className="text-amber-600 dark:text-amber-400" />
                คำแนะนำในการเชื่อมต่อ Neon PostgreSQL เข้ากับระบบ:
              </p>
              <ol className="list-decimal pl-5 space-y-1 text-slate-700 dark:text-slate-300">
                <li>ไปที่ <b>neon.tech</b> &rarr; สร้างโปรเจกต์ฐานข้อมูลฟรี</li>
                <li>คัดลอก Connection String เช่น: <code className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">postgresql://neondb_owner:***@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require</code></li>
                <li>ใส่ค่าในไฟล์ <code className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">.env.local</code>: <code className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">DATABASE_URL=postgresql://...</code></li>
                <li>กดปุ่ม <b>"รัน Migrate & Seed บน Neon (1-Click)"</b> ด้านบน หรือรันคำสั่ง <code className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">npm run db:setup</code> ใน Terminal</li>
              </ol>
            </div>
          </div>
        ) : (
          /* Table View */
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
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
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 dark:text-slate-500 font-sans">
                      ไม่พบข้อมูลแถวในตารางนี้
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      {activeDbTab === "bank_accounts" && (
                        <>
                          <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-slate-200">{row.id}</td>
                          <td className="py-2.5 px-4 font-bold text-blue-600 dark:text-blue-400">{row.account_number}</td>
                          <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">{row.user_id}</td>
                          <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">{row.account_type}</td>
                          <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">{row.currency}</td>
                          <td className="py-2.5 px-4 text-right font-black text-slate-900 dark:text-slate-100">
                            ฿{Number(row.balance).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                row.status === "ACTIVE"
                                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                  : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-[10px] text-slate-400 dark:text-slate-500">
                            {new Date(row.updated_at).toLocaleTimeString("th-TH")}
                          </td>
                        </>
                      )}

                      {activeDbTab === "users" && (
                        <>
                          <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-slate-200">{row.id}</td>
                          <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-slate-200 font-sans">
                            {row.first_name} {row.last_name}
                          </td>
                          <td className="py-2.5 px-4 text-blue-600 dark:text-blue-400">{row.email}</td>
                          <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">{row.phone || "-"}</td>
                          <td className="py-2.5 px-4 font-bold text-purple-700 dark:text-purple-300">{row.role}</td>
                          <td className="py-2.5 px-4 text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[150px]">{row.password_hash}</td>
                          <td className="py-2.5 px-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                row.status === "ACTIVE"
                                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                  : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                        </>
                      )}

                      {activeDbTab === "transactions" && (
                        <>
                          <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-slate-200">{row.id}</td>
                          <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                            {row.transaction_reference}
                          </td>
                          <td className="py-2.5 px-4 font-bold text-blue-700 dark:text-blue-400">{row.type}</td>
                          <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400">{row.from_account_id || "NULL"}</td>
                          <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400">{row.to_account_id || "NULL"}</td>
                          <td className="py-2.5 px-4 text-right font-black text-slate-900 dark:text-slate-100">
                            ฿{Number(row.amount).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              {row.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-sans text-slate-600 dark:text-slate-400 truncate max-w-[150px]">
                            {row.description || "-"}
                          </td>
                        </>
                      )}

                      {activeDbTab === "audit_logs" && (
                        <>
                          <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-slate-200">{row.id}</td>
                          <td className="py-2.5 px-4 font-bold text-purple-700 dark:text-purple-300">{row.action}</td>
                          <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">{row.actor_user_id || "System"}</td>
                          <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400">{row.entity_type}</td>
                          <td className="py-2.5 px-4 font-bold text-slate-700 dark:text-slate-300">{row.entity_id || "-"}</td>
                          <td className="py-2.5 px-4 font-sans text-slate-600 dark:text-slate-400 truncate max-w-[180px]">
                            {row.reason || "-"}
                          </td>
                          <td className="py-2.5 px-4 text-[10px] text-slate-400 dark:text-slate-500">
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
        )}
      </div>

      {/* Adjustment Modal */}
      {adjOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl transition-colors">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">
              ปรับปรุงยอดเงินบัญชี (Administrative Adjustment)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              การปรับยอดจะถูกบันทึกประวัติลง Audit Trail อย่างเคร่งครัด
            </p>

            <div className="space-y-4">
              {/* Type: Credit vs Debit */}
              <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setAdjType("CREDIT")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    adjType === "CREDIT"
                      ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  เพิ่มยอดเงิน (CREDIT)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjType("DEBIT")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    adjType === "DEBIT"
                      ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  หักยอดเงิน (DEBIT)
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  รหัสบัญชีเป้าหมาย (Account ID)
                </label>
                <input
                  type="number"
                  placeholder="เช่น 1 หรือ 2"
                  value={adjAccountId}
                  onChange={(e) => setAdjAccountId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  จำนวนเงิน (บาท)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="0.00"
                  value={adjAmount}
                  onChange={(e) => setAdjAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  เหตุผลในการปรับปรุงยอด (Compulsory Reason)
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="เช่น ชดเชยกรณีระบบขัดข้องตามคำสั่งผู้บริหาร..."
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              {adjError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="text-rose-600 dark:text-rose-400" />
                  <span>{adjError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAdjOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
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
