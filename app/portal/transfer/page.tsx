// app/portal/transfer/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, Building2, AlertCircle, Sparkles } from "lucide-react";
import ConfirmModal from "@/app/components/ConfirmModal";
import TransactionReceiptModal from "@/app/components/TransactionReceiptModal";

export default function TransferPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [fromAccountId, setFromAccountId] = useState<number | null>(null);
  const [toAccountNumber, setToAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [latestTx, setLatestTx] = useState<any>(null);

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/accounts");
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const json = await res.json();
      if (json.success && json.data?.accounts) {
        setAccounts(json.data.accounts);
        if (json.data.accounts.length > 0) {
          setFromAccountId(json.data.accounts[0].id);
        }
      }
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const selectedAccount = accounts.find((a) => a.id === fromAccountId) || accounts[0];

  const handleReviewTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedAccount) {
      setError("ไม่พบบัญชีต้นทาง");
      return;
    }

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError("กรุณากรอกจำนวนเงินที่ถูกต้อง");
      return;
    }

    if (numAmount > Number(selectedAccount.balance)) {
      setError(
        `ยอดเงินไม่พอสำหรับการโอน (คงเหลือ ฿${Number(selectedAccount.balance).toLocaleString("th-TH", {
          minimumFractionDigits: 2,
        })} บาท)`
      );
      return;
    }

    if (toAccountNumber.trim() === selectedAccount.account_number) {
      setError("ไม่สามารถโอนเงินไปยังบัญชีเดียวกันได้");
      return;
    }

    if (toAccountNumber.trim().length < 10) {
      setError("กรุณากรอกเลขที่บัญชีปลายทาง 10 หลัก");
      return;
    }

    setConfirmOpen(true);
  };

  const handleExecuteTransfer = async () => {
    setIsSubmitting(true);
    setError(null);

    const idempotencyKey = `tx-transfer-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    try {
      const res = await fetch("/api/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from_account_id: selectedAccount.id,
          to_account_number: toAccountNumber.trim(),
          amount: Number(amount),
          description: description || "โอนเงิน",
          idempotency_key: idempotencyKey,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "ไม่สามารถทำรายการโอนเงินได้");
      }

      setConfirmOpen(false);
      setLatestTx(json.data.transaction);
      setReceiptOpen(true);
      setAmount("");
      setDescription("");

      await fetchAccounts();
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการโอนเงิน");
      setConfirmOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto space-y-6 animate-pulse py-6">
        <div className="h-8 w-48 bg-slate-200 rounded-xl" />
        <div className="h-96 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-4 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <ArrowLeftRight className="text-blue-600 dark:text-blue-400" size={24} />
          โอนเงินออนไลน์ (Instant Transfer)
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          โอนเงินไปยังบัญชีอื่นในระบบได้อย่างรวดเร็ว แม่นยำ และไม่มีค่าธรรมเนียม
        </p>
      </div>

      {/* Main Transfer Form Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm transition-colors">
        {/* Quick Sample Recipients Bar */}
        <div className="mb-6 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            <Sparkles size={13} className="text-blue-600 dark:text-blue-400" />
            <span>คลิกใส่เลขบัญชีปลายทางตัวอย่างทันที:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setToAccountNumber("1008765432")}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono text-xs transition-colors flex items-center gap-1.5"
            >
              <span>1008765432</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">(คุณมณี)</span>
            </button>
            <button
              type="button"
              onClick={() => setToAccountNumber("1009998877")}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono text-xs transition-colors flex items-center gap-1.5"
            >
              <span>1009998877</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">(คุณอนันดา)</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleReviewTransfer} className="space-y-4">
          {/* Source Account */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              จากบัญชีต้นทาง
            </label>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
                  <Building2 size={18} />
                </div>
                <div>
                  <p className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                    {selectedAccount?.account_number}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {selectedAccount?.account_type} Account
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">ยอดคงเหลือ</p>
                <p className="font-mono text-sm font-black text-blue-600 dark:text-blue-400">
                  ฿
                  {Number(selectedAccount?.balance || 0).toLocaleString("th-TH", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Destination */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              เลขที่บัญชีปลายทาง (10 หลัก)
            </label>
            <input
              type="text"
              required
              maxLength={20}
              placeholder="เช่น 1008765432"
              value={toAccountNumber}
              onChange={(e) => setToAccountNumber(e.target.value.replace(/\D/g, ""))}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-base font-bold tracking-wider focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-colors"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              จำนวนเงินที่ต้องการโอน (บาท)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 font-mono font-bold text-blue-600 text-lg">
                ฿
              </span>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xl font-black focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>

            <div className="grid grid-cols-4 gap-2 mt-2">
              {[100, 500, 1000, 5000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset.toString())}
                  className="py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-mono font-bold hover:bg-slate-200 transition-colors"
                >
                  +{preset.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              บันทึกช่วยจำ (ไม่บังคับ)
            </label>
            <input
              type="text"
              placeholder="เช่น ค่าอาหาร, คืนเงิน"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500">ค่าธรรมเนียม</span>
            <span className="font-mono text-emerald-600 font-bold">ฟรี (0.00 THB)</span>
          </div>

          <button
            type="submit"
            disabled={!amount || Number(amount) <= 0 || !toAccountNumber}
            className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md shadow-blue-500/20 transition-all active:scale-[0.99] disabled:opacity-40"
          >
            ตรวจสอบและยืนยันการโอนเงิน
          </button>
        </form>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleExecuteTransfer}
        isLoading={isSubmitting}
        title="ยืนยันคำสั่งโอนเงิน"
        description="กรุณาตรวจสอบบัญชีปลายทางและจำนวนเงินให้ถูกต้องก่อนยืนยัน"
        type="info"
        confirmText="ยืนยันการโอนเงิน"
        details={[
          {
            label: "จากบัญชีต้นทาง",
            value: selectedAccount?.account_number || "",
          },
          {
            label: "ไปยังบัญชีปลายทาง",
            value: toAccountNumber,
          },
          {
            label: "จำนวนเงิน",
            value: `฿${Number(amount).toLocaleString("th-TH", {
              minimumFractionDigits: 2,
            })} THB`,
            isHighlight: true,
          },
          {
            label: "ค่าธรรมเนียม",
            value: "0.00 THB",
          },
          {
            label: "บันทึกช่วยจำ",
            value: description || "โอนเงิน",
          },
        ]}
      />

      {/* Receipt Modal */}
      <TransactionReceiptModal
        isOpen={receiptOpen}
        onClose={() => {
          setReceiptOpen(false);
          router.push("/portal");
        }}
        transaction={latestTx}
      />
    </div>
  );
}
