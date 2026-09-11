// app/components/ConfirmModal.tsx
"use client";
import React from "react";
import { AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  details?: { label: string; value: string; isHighlight?: boolean }[];
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  type?: "info" | "warning" | "danger";
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  details = [],
  confirmText = "ยืนยันทำรายการ",
  cancelText = "ยกเลิก",
  isLoading = false,
  type = "info",
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const iconColors = {
    info: "text-blue-600 bg-blue-50 border-blue-200",
    warning: "text-amber-600 bg-amber-50 border-amber-200",
    danger: "text-rose-600 bg-rose-50 border-rose-200",
  };

  const btnColors = {
    info: "bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm",
    warning: "bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-sm",
    danger: "bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-sm",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2.5 rounded-2xl border ${iconColors[type]}`}>
            {type === "danger" ? (
              <ShieldAlert size={24} />
            ) : type === "warning" ? (
              <AlertCircle size={24} />
            ) : (
              <CheckCircle2 size={24} />
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
            {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>}
          </div>
        </div>

        {/* Details Table */}
        {details.length > 0 && (
          <div className="my-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 divide-y divide-slate-200/80 dark:divide-slate-700 text-xs">
            {details.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-2.5 first:pt-0 last:pb-0">
                <span className="text-slate-500 dark:text-slate-400 font-medium">{item.label}</span>
                <span
                  className={`font-mono ${
                    item.isHighlight
                      ? "text-blue-600 dark:text-blue-400 font-black text-sm"
                      : "text-slate-800 dark:text-slate-200 font-bold"
                  }`}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 text-xs rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 ${btnColors[type]}`}
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>{isLoading ? "กำลังดำเนินการ..." : confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
