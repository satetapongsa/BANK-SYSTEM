// app/admin/users/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { Users, Search, UserPlus, Ban, CheckCircle, AlertCircle } from "lucide-react";

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

  const [targetUser, setTargetUser] = useState<AdminUser | null>(null);
  const [statusReason, setStatusReason] = useState("");
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("123456");
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="text-blue-600" size={24} />
            จัดการสมาชิกและผู้ใช้งาน (User Directory)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ควบคุมสิทธิ์ ระงับ/เปิดใช้งานบัญชีสมาชิก และเปิดบัญชีใหม่
          </p>
        </div>

        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
        >
          <UserPlus size={16} />
          <span>เพิ่มสมาชิกใหม่</span>
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาตามชื่อ, อีเมล, หรือเบอร์โทรศัพท์..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
          />
        </div>
        <button
          onClick={fetchUsers}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200"
        >
          ค้นหา
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-5">ชื่อ-นามสกุล / อีเมล</th>
                <th className="py-3 px-4">สิทธิ์ (Role)</th>
                <th className="py-3 px-4">เบอร์โทร</th>
                <th className="py-3 px-4 text-center">จำนวนบัญชี</th>
                <th className="py-3 px-4 text-right">ยอดเงินรวม</th>
                <th className="py-3 px-4 text-center">สถานะ</th>
                <th className="py-3 px-5 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    กำลังโหลดข้อมูลสมาชิก...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    ไม่พบรายชื่อสมาชิก
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-5">
                      <p className="font-bold text-slate-900">
                        {u.first_name} {u.last_name}
                      </p>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">{u.email}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          u.role === "ADMIN"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {u.phone || "-"}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700">
                      {u.accountsCount}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900">
                      ฿{Number(u.totalBalance).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          u.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
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
                              ? "text-rose-600 hover:bg-rose-50 border border-rose-200"
                              : "text-emerald-600 hover:bg-emerald-50 border border-emerald-200"
                          }`}
                        >
                          {u.status === "ACTIVE" ? "ระงับการใช้งาน" : "ปลดระงับ"}
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">Protected</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {targetUser.status === "ACTIVE"
                ? `ระงับบัญชีผู้ใช้ (${targetUser.email})`
                : `เปิดใช้งานบัญชีผู้ใช้ (${targetUser.email})`}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              ต้องระบุเหตุผลในการบันทึก Audit Log เสมอ
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  เหตุผลในการเปลี่ยนสถานะ (Compulsory Reason)
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="เช่น ตรวจสอบความปลอดภัยตามคำขอ..."
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              {statusError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="text-rose-600" />
                  <span>{statusError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={handleUpdateStatus}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all disabled:opacity-50 ${
                    targetUser.status === "ACTIVE"
                      ? "bg-rose-600 hover:bg-rose-700 text-white"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 mb-1">เพิ่มสมาชิกใหม่ (New User)</h3>
            <p className="text-xs text-slate-500 mb-4">
              ระบบจะเปิดบัญชีเงินฝากให้อัตโนมัติทันที
            </p>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อจริง</label>
                  <input
                    type="text"
                    required
                    value={createFirstName}
                    onChange={(e) => setCreateFirstName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">นามสกุล</label>
                  <input
                    type="text"
                    required
                    value={createLastName}
                    onChange={(e) => setCreateLastName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">อีเมล</label>
                <input
                  type="email"
                  required
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">รหัสผ่าน</label>
                <input
                  type="text"
                  required
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">เบอร์โทร</label>
                  <input
                    type="tel"
                    value={createPhone}
                    onChange={(e) => setCreatePhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">เงินประเดิม (บาท)</label>
                  <input
                    type="number"
                    value={createDeposit}
                    onChange={(e) => setCreateDeposit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {createError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="text-rose-600" />
                  <span>{createError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm disabled:opacity-50"
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
