// app/portal/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Copy,
  Check,
  Eye,
  EyeOff,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building,
} from "lucide-react";
import ConfirmModal from "@/app/components/ConfirmModal";
import TransactionReceiptModal from "@/app/components/TransactionReceiptModal";

interface BankAccount {
  id: number;
  account_number: string;
  account_type: string;
  currency: string;
  balance: string;
  status: string;
}

interface TransactionItem {
  id: number;
  transaction_reference: string;
  type: string;
  status: string;
  amount: string;
  description: string;
  created_at: string;
  from_account_number?: string;
  to_account_number?: string;
}

export default function MemberPortalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [showBalance, setShowBalance] = useState(true);
  const [copiedAcc, setCopiedAcc] = useState(false);

  // Modal states
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositDesc, setDepositDesc] = useState("ฝากเงินเข้าบัญชี");

  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawDesc, setWithdrawDesc] = useState("ถอนเงินสด");

  // Confirmation modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<"DEPOSIT" | "WITHDRAW">("DEPOSIT");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Receipt modal state
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
      const accList: BankAccount[] = meJson.data.accounts || [];
      setAccounts(accList);
      if (accList.length > 0 && !selectedAccountId) {
        setSelectedAccountId(accList[0].id);
      }

      // Load transactions
      const txRes = await fetch("/api/transactions?limit=8");
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

      // Success
      setConfirmOpen(false);
      setDepositModalOpen(false);
      setWithdrawModalOpen(false);
      setDepositAmount("");
      setWithdrawAmount("");
      setLatestTx(json.data.transaction);
      setReceiptOpen(true);

      // Refresh data
      await loadData();
    } catch (err: any) {
      setActionError(err.message || "เกิดข้อผิดพลาดในการทำรายการ");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-800/60 rounded-xl" />
        <div className="h-64 bg-slate-850/60 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="h-32 bg-slate-850/60 rounded-2xl" />
          <div className="h-32 bg-slate-850/60 rounded-2xl" />
          <div className="h-32 bg-slate-850/60 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-850/80 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            สวัสดี, {user?.first_name} {user?.last_name} 👋
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            ยินดีต้อนรับสู่ APEX Digital Banking พอร์ทัลบัญชีส่วนบุคคลของคุณ
          </p>
        </div>

        {/* Account Selector if multiple */}
        {accounts.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">เลือกบัญชี:</span>
            <select
              value={selectedAccountId || ""}
              onChange={(e) => setSelectedAccountId(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono font-semibold focus:outline-none focus:border-cyan-500"
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

      {/* Main Glass Bank Card */}
      {activeAccount ? (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 p-7 shadow-2xl backdrop-blur-xl">
          {/* Subtle decorative circuit lines */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-800/80 text-cyan-400 font-mono text-[11px] font-bold uppercase tracking-wider">
                  {activeAccount.account_type} ACCOUNT
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    activeAccount.status === "ACTIVE"
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60"
                      : "bg-rose-950 text-rose-400 border border-rose-800/60"
                  }`}
                >
                  {activeAccount.status}
                </span>
              </div>

              {/* Account Number */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">เลขที่บัญชี:</span>
                <span className="font-mono text-slate-200 font-bold text-sm tracking-wider">
                  {activeAccount.account_number}
                </span>
                <button
                  onClick={handleCopyAccountNumber}
                  className="p-1 text-slate-400 hover:text-cyan-400 transition-colors"
                  title="คัดลอกเลขที่บัญชี"
                >
                  {copiedAcc ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>

              {/* Balance display */}
              <div className="pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400">ยอดเงินคงเหลือที่ใช้ได้</span>
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showBalance ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-slate-100 mt-1">
                  {showBalance ? (
                    <>
                      ฿
                      {Number(activeAccount.balance).toLocaleString("th-TH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      <span className="text-xs text-slate-400 font-normal">THB</span>
                    </>
                  ) : (
                    "••••••••••"
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/portal/transfer"
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98]"
              >
                <ArrowLeftRight size={16} />
                <span>โอนเงินทันที</span>
              </Link>

              <button
                onClick={() => setDepositModalOpen(true)}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-emerald-400 border border-slate-700 font-bold text-xs transition-all active:scale-[0.98]"
              >
                <ArrowDownLeft size={16} />
                <span>ฝากเงิน</span>
              </button>

              <button
                onClick={() => setWithdrawModalOpen(true)}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-amber-400 border border-slate-700 font-bold text-xs transition-all active:scale-[0.98]"
              >
                <ArrowUpRight size={16} />
                <span>ถอนเงิน</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl">
          <Building size={36} className="mx-auto text-slate-600 mb-2" />
          <p className="text-sm font-semibold text-slate-300">ยังไม่มีบัญชีเงินฝาก</p>
        </div>
      )}

      {/* Recent Activity Table */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Clock size={18} className="text-cyan-400" />
              <span>รายการธุรกรรมล่าสุด (Recent Transactions)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              แสดง 8 รายการล่าสุดของบัญชีคุณ
            </p>
          </div>
          <Link
            href="/portal/transactions"
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            ดูทั้งหมด &rarr;
          </Link>
        </div>

        {transactions.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            ยังไม่มีรายการธุรกรรมในระบบ เริ่มต้นด้วยการฝากเงินหรือโอนเงิน
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60 overflow-x-auto">
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
                  className="py-3.5 flex items-center justify-between hover:bg-slate-800/30 px-2 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isPositive
                          ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                          : "bg-slate-800/80 text-cyan-400 border border-slate-700/60"
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
                      <p className="text-xs font-bold text-slate-200">
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
                      className={`font-mono text-sm font-bold ${
                        isPositive ? "text-emerald-400" : "text-slate-100"
                      }`}
                    >
                      {isPositive ? "+" : "-"}฿
                      {Number(tx.amount).toLocaleString("th-TH", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100 mb-1">ฝากเงินเข้าบัญชี (Deposit)</h3>
            <p className="text-xs text-slate-400 mb-4">
              ฝากเงินเข้าบัญชี {activeAccount.account_number}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  จำนวนเงินที่ต้องการฝาก (บาท)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 font-mono font-bold text-cyan-400">
                    ฿
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="1000.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[500, 1000, 5000, 10000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(amt.toString())}
                    className="py-1.5 text-xs font-mono font-bold rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:border-cyan-500 hover:text-cyan-400 transition-colors"
                  >
                    +{amt.toLocaleString()}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  บันทึกช่วยจำ (Description)
                </label>
                <input
                  type="text"
                  value={depositDesc}
                  onChange={(e) => setDepositDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              {actionError && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>{actionError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setDepositModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200"
                >
                  ยกเลิก
                </button>
                <button
                  disabled={!depositAmount || Number(depositAmount) <= 0}
                  onClick={() => handleOpenConfirm("DEPOSIT")}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100 mb-1">ถอนเงินสด (Withdraw)</h3>
            <p className="text-xs text-slate-400 mb-4">
              ถอนจากบัญชี {activeAccount.account_number} (ยอดคงเหลือ ฿
              {Number(activeAccount.balance).toLocaleString("th-TH")})
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  จำนวนเงินที่ต้องการถอน (บาท)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 font-mono font-bold text-amber-400">
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
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[500, 1000, 2000, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setWithdrawAmount(amt.toString())}
                    className="py-1.5 text-xs font-mono font-bold rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:border-amber-500 hover:text-amber-400 transition-colors"
                  >
                    ฿{amt.toLocaleString()}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  บันทึกช่วยจำ (Description)
                </label>
                <input
                  type="text"
                  value={withdrawDesc}
                  onChange={(e) => setWithdrawDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {actionError && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>{actionError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setWithdrawModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200"
                >
                  ยกเลิก
                </button>
                <button
                  disabled={!withdrawAmount || Number(withdrawAmount) <= 0}
                  onClick={() => handleOpenConfirm("WITHDRAW")}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50"
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
        description="โปรดตรวจสอบรายละเอียดด้านล่างก่อนยืนยันการทำรายการ"
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
