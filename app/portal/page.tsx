// app/portal/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Copy,
  Check,
  Eye,
  EyeOff,
  Clock,
  AlertCircle,
  Building2,
  Wallet,
} from "lucide-react";
import ConfirmModal from "@/app/components/ConfirmModal";
import TransactionReceiptModal from "@/app/components/TransactionReceiptModal";

export default function MemberPortalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showBalance, setShowBalance] = useState(true);
  const [copiedAcc, setCopiedAcc] = useState(false);

  // Modal states
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositDesc, setDepositDesc] = useState("ฝากเงินเข้าบัญชี");

  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawDesc, setWithdrawDesc] = useState("ถอนเงินสด");

  // Confirmation & Receipt states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<"DEPOSIT" | "WITHDRAW">("DEPOSIT");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [receiptOpen, setReceiptOpen] = useState(false);
  const [latestTx, setLatestTx] = useState<any>(null);

  const loadData = async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      if (!meRes.ok) {
        router.push("/login");
        return;
      }
      const meJson = await meRes.json();
      if (!meJson.success || !meJson.data) {
        router.push("/login");
        return;
      }

      setUser(meJson.data.user);
      const accList = meJson.data.accounts || [];
      setAccounts(accList);
      if (accList.length > 0 && !selectedAccountId) {
        setSelectedAccountId(accList[0].id);
      }

      // Load transactions
      const txRes = await fetch("/api/transactions?limit=10");
      if (txRes.ok) {
        const txJson = await txRes.json();
        if (txJson.success) {
          setTransactions(txJson.data.transactions || []);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeAccount =
    accounts.find((a) => a.id === selectedAccountId) || accounts[0] || null;

  const handleCopyAccountNumber = () => {
    if (!activeAccount) return;
    navigator.clipboard.writeText(activeAccount.account_number);
    setCopiedAcc(true);
    setTimeout(() => setCopiedAcc(false), 2000);
  };

  const handleOpenConfirm = (type: "DEPOSIT" | "WITHDRAW") => {
    setActionError(null);
    setConfirmType(type);
    setConfirmOpen(true);
  };

  const handleExecuteAction = async () => {
    if (!activeAccount) return;
    setIsSubmitting(true);
    setActionError(null);

    const isDeposit = confirmType === "DEPOSIT";
    const endpoint = isDeposit ? "/api/deposits" : "/api/withdrawals";
    const amount = isDeposit ? Number(depositAmount) : Number(withdrawAmount);
    const desc = isDeposit ? depositDesc : withdrawDesc;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_id: activeAccount.id,
          amount,
          description: desc,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "ทำรายการไม่สำเร็จ");
      }

      setConfirmOpen(false);
      setDepositModalOpen(false);
      setWithdrawModalOpen(false);
      setDepositAmount("");
      setWithdrawAmount("");
      setLatestTx(json.data.transaction);
      setReceiptOpen(true);

      await loadData();
    } catch (err: any) {
      setActionError(err.message || "เกิดข้อผิดพลาดในการทำรายการ");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse py-6">
        <div className="h-8 w-48 bg-slate-200 rounded-xl" />
        <div className="h-56 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in py-4">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            สวัสดี, คุณ{user?.first_name} {user?.last_name} 👋
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ยินดีต้อนรับสู่ APEX Digital Banking หน้าบัญชีส่วนบุคคลของคุณ
          </p>
        </div>

        {accounts.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">เลือกบัญชี:</span>
            <select
              value={selectedAccountId || ""}
              onChange={(e) => setSelectedAccountId(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-mono font-bold focus:outline-none focus:border-blue-500"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.account_type} - {acc.account_number}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Clean Bank Card */}
      {activeAccount ? (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-800 p-6 sm:p-8 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-lg bg-white/20 text-white font-mono text-[10px] font-bold uppercase tracking-wider">
                  {activeAccount.account_type} ACCOUNT
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-400 text-slate-950">
                  {activeAccount.status}
                </span>
              </div>

              {/* Account Number */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-blue-200">เลขที่บัญชี:</span>
                <span className="font-mono text-white font-bold text-sm tracking-wider">
                  {activeAccount.account_number}
                </span>
                <button
                  onClick={handleCopyAccountNumber}
                  className="p-1 text-blue-200 hover:text-white transition-colors"
                  title="คัดลอกเลขบัญชี"
                >
                  {copiedAcc ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
                </button>
              </div>

              {/* Balance */}
              <div className="pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-blue-200">ยอดเงินคงเหลือที่ใช้ได้</span>
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="text-blue-300 hover:text-white transition-colors"
                  >
                    {showBalance ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white mt-1">
                  {showBalance ? (
                    <>
                      ฿
                      {Number(activeAccount.balance).toLocaleString("th-TH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      <span className="text-xs text-blue-200 font-normal">THB</span>
                    </>
                  ) : (
                    "••••••••••"
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/portal/transfer"
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shadow-md transition-all active:scale-[0.98]"
              >
                <ArrowLeftRight size={16} />
                <span>โอนเงินทันที</span>
              </Link>

              <button
                onClick={() => setDepositModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-blue-800/80 hover:bg-blue-800 text-white border border-blue-600 font-bold text-xs transition-all active:scale-[0.98]"
              >
                <ArrowDownLeft size={16} className="text-emerald-300" />
                <span>ฝากเงิน</span>
              </button>

              <button
                onClick={() => setWithdrawModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-blue-800/80 hover:bg-blue-800 text-white border border-blue-600 font-bold text-xs transition-all active:scale-[0.98]"
              >
                <ArrowUpRight size={16} className="text-amber-300" />
                <span>ถอนเงิน</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-white border border-slate-200 rounded-3xl">
          <Building2 size={36} className="mx-auto text-slate-400 mb-2" />
          <p className="text-sm font-semibold text-slate-600">ยังไม่มีบัญชีเงินฝาก</p>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Clock size={18} className="text-blue-600" />
              <span>รายการธุรกรรมล่าสุด</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              10 รายการล่าสุดในบัญชีของคุณ
            </p>
          </div>
          <Link
            href="/portal/transactions"
            className="text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            ดูทั้งหมด &rarr;
          </Link>
        </div>

        {transactions.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            ยังไม่มีประวัติธุรกรรมในบัญชีนี้
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            {transactions.map((tx) => {
              const isPositive =
                tx.type === "DEPOSIT" ||
                (tx.type === "TRANSFER" && tx.to_account_number === activeAccount?.account_number);

              return (
                <div
                  key={tx.id}
                  onClick={() => {
                    setLatestTx(tx);
                    setReceiptOpen(true);
                  }}
                  className="py-3.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isPositive
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {tx.type === "DEPOSIT" ? (
                        <ArrowDownLeft size={16} />
                      ) : tx.type === "WITHDRAW" ? (
                        <ArrowUpRight size={16} />
                      ) : (
                        <ArrowLeftRight size={16} />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {tx.description || tx.type}
                      </p>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                        {tx.transaction_reference} •{" "}
                        {new Date(tx.created_at).toLocaleDateString("th-TH")}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`font-mono text-sm font-black ${
                        isPositive ? "text-emerald-600" : "text-slate-900"
                      }`}
                    >
                      {isPositive ? "+" : "-"}฿
                      {Number(tx.amount).toLocaleString("th-TH", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Deposit Modal */}
      {depositModalOpen && activeAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 mb-1">ฝากเงินเข้าบัญชี (Deposit)</h3>
            <p className="text-xs text-slate-500 mb-4">
              ฝากเข้าบัญชี {activeAccount.account_number}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  จำนวนเงินที่ต้องการฝาก (บาท)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-mono font-bold text-blue-600">
                    ฿
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="1000.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Presets */}
              <div className="grid grid-cols-4 gap-2">
                {[500, 1000, 5000, 10000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(amt.toString())}
                    className="py-1.5 text-xs font-mono font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    +{amt.toLocaleString()}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  บันทึกช่วยจำ
                </label>
                <input
                  type="text"
                  value={depositDesc}
                  onChange={(e) => setDepositDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              {actionError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="text-rose-600" />
                  <span>{actionError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  onClick={() => setDepositModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  ยกเลิก
                </button>
                <button
                  disabled={!depositAmount || Number(depositAmount) <= 0}
                  onClick={() => handleOpenConfirm("DEPOSIT")}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm disabled:opacity-50"
                >
                  ตรวจสอบและยืนยัน
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {withdrawModalOpen && activeAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 mb-1">ถอนเงินสด (Withdraw)</h3>
            <p className="text-xs text-slate-500 mb-4">
              ถอนจากบัญชี {activeAccount.account_number} (ยอดคงเหลือ ฿
              {Number(activeAccount.balance).toLocaleString("th-TH")})
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  จำนวนเงินที่ต้องการถอน (บาท)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-mono font-bold text-amber-600">
                    ฿
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max={Number(activeAccount.balance)}
                    placeholder="500.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Presets */}
              <div className="grid grid-cols-4 gap-2">
                {[500, 1000, 2000, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setWithdrawAmount(amt.toString())}
                    className="py-1.5 text-xs font-mono font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    ฿{amt.toLocaleString()}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  บันทึกช่วยจำ
                </label>
                <input
                  type="text"
                  value={withdrawDesc}
                  onChange={(e) => setWithdrawDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              {actionError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="text-rose-600" />
                  <span>{actionError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  onClick={() => setWithdrawModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  ยกเลิก
                </button>
                <button
                  disabled={!withdrawAmount || Number(withdrawAmount) <= 0}
                  onClick={() => handleOpenConfirm("WITHDRAW")}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm disabled:opacity-50"
                >
                  ตรวจสอบและยืนยัน
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleExecuteAction}
        isLoading={isSubmitting}
        title={confirmType === "DEPOSIT" ? "ยืนยันการฝากเงิน" : "ยืนยันการถอนเงิน"}
        description="โปรดตรวจสอบรายละเอียดด้านล่างก่อนยืนยัน"
        type={confirmType === "DEPOSIT" ? "info" : "warning"}
        confirmText="ยืนยันทำรายการ"
        details={[
          {
            label: "บัญชีธนาคาร",
            value: activeAccount?.account_number || "",
          },
          {
            label: "ประเภทรายการ",
            value: confirmType === "DEPOSIT" ? "ฝากเงินเข้าบัญชี" : "ถอนเงินสด",
          },
          {
            label: "จำนวนเงิน",
            value: `฿${Number(
              confirmType === "DEPOSIT" ? depositAmount : withdrawAmount
            ).toLocaleString("th-TH", { minimumFractionDigits: 2 })} THB`,
            isHighlight: true,
          },
          {
            label: "ค่าธรรมเนียม",
            value: "0.00 THB",
          },
        ]}
      />

      {/* Receipt Modal */}
      <TransactionReceiptModal
        isOpen={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        transaction={latestTx}
      />
    </div>
  );
}
