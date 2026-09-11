// app/admin/accounts/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { CreditCard, Search, Ban, CheckCircle, AlertCircle, Shield } from "lucide-react";

interface AdminAccount {
  id: number;
  user_id: number;
  account_number: string;
  account_type: string;
  currency: string;
  balance: string;
  status: "ACTIVE" | "SUSPENDED" | "CLOSED";
  created_at: string;
  owner_name: string;
  owner_email: string;
}

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Status Change Modal
  const [targetAccount, setTargetAccount] = useState<AdminAccount | null>(null);
  const [newStatus, setNewStatus] = useState<"ACTIVE" | "SUSPENDED" | "CLOSED">("SUSPENDED");
  const [reason, setReason] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = async () => {
    try {
      let url = "/api/admin/accounts";
      if (searchTerm.trim()) url += `?q=${encodeURIComponent(searchTerm.trim())}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setAccounts(json.data.accounts || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleUpdateAccountStatus = async () => {
    if (!targetAccount) return;
    if (!reason || reason.trim().length < 3) {
      setError("ต้องระบุเหตุผลในการเปลี่ยนสถานะอย่างน้อย 3 ตัวอักษร");
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/accounts/${targetAccount.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          reason: reason.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "ไม่สามารถเปลี่ยนสถานะได้");
      }

      setTargetAccount(null);
      await fetchAccounts();
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-850/80 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <CreditCard className="text-cyan-400" size={24} />
            จัดการบัญชีธนาคาร (Bank Accounts Registry)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            ตรวจสอบยอดเงินคงเหลือและสถานะการเปิดใช้งานบัญชีทั้งหมดในระบบ
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="ค้นหาตามเลขที่บัญชี หรืออีเมลเจ้าของบัญชี..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchAccounts()}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
        <button
          onClick={fetchAccounts}
          className="px-4 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800 transition-colors"
        >
          ค้นหา
        </button>
      </div>

      {/* Accounts Table */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-5">เลขที่บัญชี / ประเภท</th>
                <th className="py-3.5 px-4">เจ้าของบัญชี</th>
                <th className="py-3.5 px-4 text-right">ยอดเงินคงเหลือ</th>
                <th className="py-3.5 px-4 text-center">สถานะ</th>
                <th className="py-3.5 px-5 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/80">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    กำลังโหลดข้อมูลบัญชี...
                  </td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    ไม่พบบัญชีธนาคาร
                  </td>
                </tr>
              ) : (
                accounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-850/40 transition-colors">
                    <td className="py-3.5 px-5">
                      <p className="font-mono font-bold text-slate-200 text-sm">
                        {acc.account_number}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {acc.account_type} • {acc.currency}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-200">{acc.owner_name}</p>
                      <p className="text-[11px] font-mono text-slate-400">{acc.owner_email}</p>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono font-black text-sm text-cyan-400">
                        ฿{Number(acc.balance).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          acc.status === "ACTIVE"
                            ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/50"
                            : acc.status === "SUSPENDED"
                            ? "bg-amber-950/80 text-amber-400 border border-amber-800/50"
                            : "bg-rose-950/80 text-rose-400 border border-rose-800/50"
                        }`}
                      >
                        {acc.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => {
                          setTargetAccount(acc);
                          setNewStatus(acc.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE");
                          setReason("");
                          setError(null);
                        }}
                        className="px-3 py-1 text-xs font-bold text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-colors"
                      >
                        เปลี่ยนสถานะ
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Change Status Modal */}
      {targetAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100 mb-1">
              ปรับสถานะบัญชี {targetAccount.account_number}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              เจ้าของ: {targetAccount.owner_name} ({targetAccount.owner_email})
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  เลือกสถานะใหม่
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["ACTIVE", "SUSPENDED", "CLOSED"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewStatus(s)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        newStatus === s
                          ? "bg-cyan-500 text-slate-950 border-cyan-400 font-bold"
                          : "bg-slate-950 text-slate-400 border-slate-800"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  เหตุผลในการเปลี่ยนสถานะ (Compulsory Reason)
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="เช่น ปิดบัญชีตามคำขอของลูกค้า หรือระงับชั่วคราว..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setTargetAccount(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={handleUpdateAccountStatus}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                >
                  {isUpdating ? "กำลังบันทึก..." : "บันทึกสถานะ"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
