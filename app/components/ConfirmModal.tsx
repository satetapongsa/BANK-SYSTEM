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
    info: "text-cyan-400 bg-cyan-950/50 border-cyan-800/60",
    warning: "text-amber-400 bg-amber-950/50 border-amber-800/60",
    danger: "text-rose-400 bg-rose-950/50 border-rose-800/60",
  };

  const btnColors = {
    info: "bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-cyan-500/20 shadow-lg",
    warning: "bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-amber-500/20 shadow-lg",
    danger: "bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-rose-600/20 shadow-lg",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Glow Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2.5 rounded-xl border ${iconColors[type]}`}>
            {type === "danger" ? (
              <ShieldAlert size={24} />
            ) : type === "warning" ? (
              <AlertCircle size={24} />
            ) : (
              <CheckCircle2 size={24} />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">{title}</h3>
            {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
          </div>
        </div>

        {/* Details Table */}
        {details.length > 0 && (
          <div className="my-5 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 divide-y divide-slate-800/60 text-sm">
            {details.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-2.5 first:pt-0 last:pb-0">
                <span className="text-slate-400 text-xs font-medium">{item.label}</span>
                <span
                  className={`font-mono text-sm ${
                    item.isHighlight
                      ? "text-cyan-400 font-bold text-base"
                      : "text-slate-200 font-semibold"
                  }`}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-3 border-t border-slate-800/80">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-xl transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 text-sm rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 ${btnColors[type]}`}
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            <span>{isLoading ? "กำลังดำเนินการ..." : confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
