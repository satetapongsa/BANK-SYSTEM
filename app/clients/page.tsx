// app/clients/page.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import * as storage from "@/app/lib/storage";
import Card from "@/app/components/Card";
import Button from "@/app/components/Button";
import { Trash2, UserPlus, Users, Search, Eye } from "lucide-react";

export default function ClientsPage() {
  const [clients, setClients] = useState<storage.Client[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setClients(storage.getClients());
  }, []);

  const handleDelete = (id: number) => {
    if (!confirm("ยืนยันการลบบัญชีลูกค้ารายนี้อย่างถาวร? ข้อมูลธุรกรรมที่เกี่ยวข้องทั้งหมดจะถูกลบออกไปด้วย")) return;
    storage.deleteClient(id);
    setClients(storage.getClients());
  };

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.account_number.includes(search)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <Users className="text-sky-400" size={24} />
            จัดการบัญชีลูกค้า (Client Registry)
          </h1>
          <p className="text-xs font-semibold text-slate-400 mt-1">
            ทะเบียนบัญชีธนาคารภายในระบบ WAVY BANK ทั้งหมด ({clients.length} บัญชี)
          </p>
        </div>
        <Link href="/clients/new">
          <Button size="md" variant="primary">
            <UserPlus size={16} />
            เปิดบัญชีใหม่
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
          <Search size={16} />
        </div>
        <input
          type="text"
          placeholder="ค้นหาชื่อลูกค้า, อีเมลติดต่อ, หรือเลขบัญชี 12 หลัก..."
          className="bank-input pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Clients Registry Card Table */}
      <Card noPadding className="overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="flex flex-col items-center justify-center gap-2">
              <Users size={40} className="text-slate-700" />
              <p className="text-sm font-semibold text-slate-500">
                {search ? "ไม่พบข้อมูลบัญชีลูกค้าตรงกับคำค้นหาของคุณ" : "ยังไม่มีประวัติบัญชีลูกค้าในฐานข้อมูล"}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 border-b border-slate-800/80">
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">ชื่อลูกค้า (Name)</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">อีเมลติดต่อ (Email)</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">เลขที่บัญชี (Account No.)</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">ยอดคงเหลือ (Balance)</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">สถานะบัญชี</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">ภูมิภาค (Region)</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((c) => (
                  <tr key={c.id} className="bank-table-row">
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-200">{c.name}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-400">{c.email}</td>
                    <td className="px-6 py-4 font-mono text-xs font-bold text-sky-400">{c.account_number}</td>
                    <td className="px-6 py-4 text-sm font-bold text-right text-slate-200">
                      ฿{Number(c.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={c.status === "Active" ? "status-pill-active" : "status-pill-blocked"}>
                        <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${c.status === "Active" ? "bg-emerald-400" : "bg-rose-400"}`} />
                        {c.status === "Active" ? "ปกติ (Active)" : "ระงับ (Blocked)"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-400">{c.region || "—"}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center gap-2">
                        {/* Manage Account details button */}
                        <Link href={`/clients/${c.id}`}>
                          <Button variant="secondary" size="sm" className="!py-1 font-bold text-sky-400 hover:text-sky-300 hover:bg-sky-950/20 border-sky-900/60">
                            <Eye size={12} />
                            จัดการบัญชี
                          </Button>
                        </Link>
                        {/* Delete permanently button */}
                        <Button
                          variant="danger"
                          size="sm"
                          iconOnly
                          onClick={() => handleDelete(c.id)}
                          className="!p-1.5"
                          title="ลบบัญชีถาวร"
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
