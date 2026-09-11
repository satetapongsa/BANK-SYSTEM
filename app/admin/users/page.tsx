// app/admin/users/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { Users, Search, UserPlus, ShieldAlert, CheckCircle, Ban, AlertCircle } from "lucide-react";
import ConfirmModal from "@/app/components/ConfirmModal";

interface AdminUser {
  id: number;
  email: string;
  role: "ADMIN" | "MEMBER";
  first_name: string;
  last_name: string;
  phone?: string;
  status: "ACTIVE" | "SUSPENDED";
  created_at: string;
  accountsCount: number;
  totalBalance: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Suspend/Activate state
  const [targetUser, setTargetUser] = useState<AdminUser | null>(null);
  const [statusReason, setStatusReason] = useState("");
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  // Create User modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("Password123!");
  const [createFirstName, setCreateFirstName] = useState("");
  const [createLastName, setCreateLastName] = useState("");
  const [createPhone, setCreatePhone] = useState("");
  const [createRole, setCreateRole] = useState<"MEMBER" | "ADMIN">("MEMBER");
  const [createDeposit, setCreateDeposit] = useState("5000");
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const fetchUsers = async () => {
    try {
      let url = "/api/admin/users";
      if (searchTerm.trim()) url += `?q=${encodeURIComponent(searchTerm.trim())}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setUsers(json.data.users || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenStatusModal = (u: AdminUser) => {
    setTargetUser(u);
    setStatusReason("");
    setStatusError(null);
    setStatusModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!targetUser) return;
    if (!statusReason || statusReason.trim().length < 3) {
      setStatusError("ต้องระบุเหตุผลในการเปลี่ยนสถานะอย่างน้อย 3 ตัวอักษร");
      return;
    }

    setIsUpdating(true);
    setStatusError(null);
    const newStatus = targetUser.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

    try {
      const res = await fetch(`/api/admin/users/${targetUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          reason: statusReason.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "ไม่สามารถเปลี่ยนสถานะได้");
      }

      setStatusModalOpen(false);
      await fetchUsers();
    } catch (err: any) {
      setStatusError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateError(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: createEmail,
          password: createPassword,
          first_name: createFirstName,
          last_name: createLastName,
          phone: createPhone,
          role: createRole,
          initialDeposit: Number(createDeposit) || 0,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "ไม่สามารถสร้างสมาชิกได้");
      }

      setCreateOpen(false);
      setCreateEmail("");
      setCreateFirstName("");
      setCreateLastName("");
      setCreatePhone("");
      await fetchUsers();
    } catch (err: any) {
      setCreateError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-850/80 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <Users className="text-cyan-400" size={24} />
            จัดการสมาชิกและผู้ใช้งาน (User Directory)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            ควบคุมสิทธิ์ ระงับ/เปิดใช้งานบัญชีสมาชิก และเปิดบัญชีใหม่
          </p>
        </div>

        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98]"
        >
          <UserPlus size={16} />
          <span>เพิ่มสมาชิกใหม่</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="ค้นหาตามชื่อ, อีเมล, หรือเบอร์โทรศัพท์..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
        <button
          onClick={fetchUsers}
          className="px-4 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800 transition-colors"
        >
          ค้นหา
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-5">ชื่อ-นามสกุล / อีเมล</th>
                <th className="py-3.5 px-4">สิทธิ์ (Role)</th>
                <th className="py-3.5 px-4">เบอร์โทร</th>
                <th className="py-3.5 px-4 text-center">จำนวนบัญชี</th>
                <th className="py-3.5 px-4 text-right">ยอดเงินรวม</th>
                <th className="py-3.5 px-4 text-center">สถานะ</th>
                <th className="py-3.5 px-5 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    กำลังโหลดข้อมูลสมาชิก...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    ไม่พบรายชื่อสมาชิก
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-850/40 transition-colors">
                    <td className="py-3.5 px-5">
                      <p className="font-bold text-slate-200">
                        {u.first_name} {u.last_name}
                      </p>
                      <p className="text-[11px] font-mono text-slate-500 mt-0.5">{u.email}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          u.role === "ADMIN"
                            ? "bg-purple-950 text-purple-400 border border-purple-800/60"
                            : "bg-cyan-950 text-cyan-400 border border-cyan-800/60"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {u.phone || "-"}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-300">
                      {u.accountsCount}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-200">
                      ฿{Number(u.totalBalance).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          u.status === "ACTIVE"
                            ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/50"
                            : "bg-rose-950/80 text-rose-400 border border-rose-800/50"
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      {u.role !== "ADMIN" ? (
                        <button
                          onClick={() => handleOpenStatusModal(u)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            u.status === "ACTIVE"
                              ? "text-rose-400 hover:bg-rose-950/50 border border-rose-800/60"
                              : "text-emerald-400 hover:bg-emerald-950/50 border border-emerald-800/60"
                          }`}
                        >
                          {u.status === "ACTIVE" ? "ระงับการใช้งาน" : "ปลดระงับ"}
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono">Protected</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suspend / Activate Modal */}
      {statusModalOpen && targetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`p-2.5 rounded-xl border ${
                  targetUser.status === "ACTIVE"
                    ? "bg-rose-950 text-rose-400 border-rose-800"
                    : "bg-emerald-950 text-emerald-400 border-emerald-800"
                }`}
              >
                {targetUser.status === "ACTIVE" ? <Ban size={22} /> : <CheckCircle size={22} />}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  {targetUser.status === "ACTIVE"
                    ? `ระงับบัญชีผู้ใช้ (${targetUser.email})`
                    : `เปิดใช้งานบัญชีผู้ใช้ (${targetUser.email})`}
                </h3>
                <p className="text-xs text-slate-400">
                  ต้องระบุเหตุผลในการบันทึก Audit Log เสมอ
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  เหตุผลในการเปลี่ยนสถานะ (Compulsory Reason)
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="เช่น ตรวจสอบความปลอดภัยตามคำขอของลูกค้า..."
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              {statusError && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>{statusError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={handleUpdateStatus}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all disabled:opacity-50 ${
                    targetUser.status === "ACTIVE"
                      ? "bg-rose-600 hover:bg-rose-500 text-white"
                      : "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                  }`}
                >
                  {isUpdating ? "กำลังบันทึก..." : "ยืนยันการเปลี่ยนสถานะ"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100 mb-1">เพิ่มสมาชิกใหม่ (New User)</h3>
            <p className="text-xs text-slate-400 mb-4">
              ระบบจะเปิดบัญชีเงินฝากอัตโนมัติสำหรับสมาชิกใหม่
            </p>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ชื่อจริง
                  </label>
                  <input
                    type="text"
                    required
                    value={createFirstName}
                    onChange={(e) => setCreateFirstName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    นามสกุล
                  </label>
                  <input
                    type="text"
                    required
                    value={createLastName}
                    onChange={(e) => setCreateLastName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">อีเมล</label>
                <input
                  type="email"
                  required
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">รหัสผ่าน</label>
                <input
                  type="password"
                  required
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    เบอร์โทร
                  </label>
                  <input
                    type="tel"
                    value={createPhone}
                    onChange={(e) => setCreatePhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    เงินประเดิม (บาท)
                  </label>
                  <input
                    type="number"
                    value={createDeposit}
                    onChange={(e) => setCreateDeposit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {createError && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>{createError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                >
                  {isCreating ? "กำลังสร้าง..." : "สร้างสมาชิก"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
