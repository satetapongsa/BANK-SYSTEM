// app/components/TransactionReceiptModal.tsx
"use client";
import React, { useState } from "react";
import { CheckCircle, Copy, Check, ShieldCheck, Download, X } from "lucide-react";

interface TransactionReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: {
    transaction_reference: string;
    type: string;
    amount: string | number;
    currency?: string;
    from_account_number?: string | null;
    to_account_number?: string | null;
    description?: string | null;
    created_at?: string;
  } | null;
}

export default function TransactionReceiptModal({
  isOpen,
  onClose,
  transaction,
}: TransactionReceiptModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !transaction) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(transaction.transaction_reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedAmount = Number(transaction.amount).toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedDate = transaction.created_at
    ? new Date(transaction.created_at).toLocaleString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : new Date().toLocaleString("th-TH");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/90 rounded-3xl shadow-2xl overflow-hidden">
        {/* Decorative Top Bar */}
        <div className="h-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-full transition-colors"
        >
          <X size={18} />
        </button>

        <div className="p-6">
          {/* Header */}
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 shadow-lg shadow-emerald-500/10">
              <CheckCircle size={32} />
            </div>
            <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">
              ทำรายการสำเร็จ
            </span>
            <h2 className="text-2xl font-black font-mono text-slate-100 mt-1">
              ฿{formattedAmount} <span className="text-xs text-slate-400">THB</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {transaction.type === "TRANSFER"
                ? "โอนเงินสำเร็จ"
                : transaction.type === "DEPOSIT"
                ? "ฝากเงินเข้าบัญชีสำเร็จ"
                : "ถอนเงินสำเร็จ"}
            </p>
          </div>

          {/* Receipt Card */}
          <div className="mt-5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 divide-y divide-slate-850 text-xs">
            {/* Reference */}
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-400">เลขอ้างอิง</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 font-mono font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <span>{transaction.transaction_reference}</span>
                {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              </button>
            </div>

            {/* From Account */}
            {transaction.from_account_number && (
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-400">จากบัญชี</span>
                <span className="font-mono text-slate-200 font-medium">
                  {transaction.from_account_number}
                </span>
              </div>
            )}

            {/* To Account */}
            {transaction.to_account_number && (
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-400">ไปยังบัญชี</span>
                <span className="font-mono text-slate-200 font-semibold text-cyan-300">
                  {transaction.to_account_number}
                </span>
              </div>
            )}

            {/* Fee */}
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-400">ค่าธรรมเนียม</span>
              <span className="font-mono text-emerald-400 font-semibold">0.00 THB</span>
            </div>

            {/* Description */}
            {transaction.description && (
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-400">บันทึกช่วยจำ</span>
                <span className="text-slate-300 truncate max-w-[160px] text-right">
                  {transaction.description}
                </span>
              </div>
            )}

            {/* Timestamp */}
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-400">วันและเวลา</span>
              <span className="font-mono text-slate-300">{formattedDate}</span>
            </div>
          </div>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-2 mt-4 text-[11px] text-slate-500 font-medium">
            <ShieldCheck size={14} className="text-cyan-500" />
            <span>ตรวจสอบและเข้ารหัสความปลอดภัยระดับธนาคาร (ACID Validated)</span>
          </div>

          {/* Done Button */}
          <button
            onClick={onClose}
            className="w-full mt-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.99]"
          >
            เสร็จสิ้น
          </button>
        </div>
      </div>
    </div>
  );
}
