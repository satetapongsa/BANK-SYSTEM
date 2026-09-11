// app/components/TransactionReceiptModal.tsx
"use client";
import React, { useState } from "react";
import { CheckCircle, Copy, Check, ShieldCheck, X } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
        {/* Top Decorative bar */}
        <div className="h-2 bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X size={18} />
        </button>

        <div className="p-6">
          {/* Header */}
          <div className="flex flex-col items-center text-center">
            <div className="w-13 h-13 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-3 shadow-sm">
              <CheckCircle size={32} />
            </div>
            <span className="text-[11px] font-bold tracking-widest text-emerald-600 uppercase">
              ทำรายการสำเร็จ
            </span>
            <h2 className="text-2xl font-black font-mono text-slate-900 mt-1">
              ฿{formattedAmount} <span className="text-xs text-slate-500 font-sans">บาท</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {transaction.type === "TRANSFER"
                ? "โอนเงินสำเร็จ"
                : transaction.type === "DEPOSIT"
                ? "ฝากเงินเข้าบัญชีสำเร็จ"
                : "ถอนเงินสดสำเร็จ"}
            </p>
          </div>

          {/* Slip Card */}
          <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 divide-y divide-slate-200/70 text-xs">
            {/* Reference */}
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-500">เลขอ้างอิง</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 font-mono font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <span>{transaction.transaction_reference}</span>
                {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              </button>
            </div>

            {/* From Account */}
            {transaction.from_account_number && (
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500">จากบัญชี</span>
                <span className="font-mono text-slate-800 font-bold">
                  {transaction.from_account_number}
                </span>
              </div>
            )}

            {/* To Account */}
            {transaction.to_account_number && (
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500">ไปยังบัญชี</span>
                <span className="font-mono text-blue-600 font-bold">
                  {transaction.to_account_number}
                </span>
              </div>
            )}

            {/* Fee */}
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-500">ค่าธรรมเนียม</span>
              <span className="font-mono text-emerald-600 font-bold">0.00 THB</span>
            </div>

            {/* Description */}
            {transaction.description && (
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500">บันทึกช่วยจำ</span>
                <span className="text-slate-800 truncate max-w-[160px] text-right font-medium">
                  {transaction.description}
                </span>
              </div>
            )}

            {/* Timestamp */}
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-500">วันและเวลา</span>
              <span className="font-mono text-slate-700">{formattedDate}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 mt-4 text-[11px] text-slate-400 font-medium">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>ตรวจสอบความปลอดภัยระดับ ACID Transaction</span>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all active:scale-[0.99]"
          >
            เสร็จสิ้น
          </button>
        </div>
      </div>
    </div>
  );
}
