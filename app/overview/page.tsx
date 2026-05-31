// app/overview/page.tsx
"use client";

import { useEffect, useState } from "react";
import * as storage from "@/app/lib/storage";
import { Wallet, Users, ArrowLeftRight, TrendingUp, Activity, Landmark } from "lucide-react";
import Card from "@/app/components/Card";

export default function ExecutiveOverview() {
  const [clients, setClients] = useState<storage.Client[]>([]);
  const [transactions, setTransactions] = useState<storage.Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cl = storage.getClients();
    const txAll = storage.getTransactions();
    const recent = txAll
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
    setClients(cl);
    setTransactions(recent);
    setLoading(false);
  }, []);

  const totalAssets = clients.reduce((sum, c) => sum + Number(c.balance), 0);
  const activeClients = clients.filter((c) => c.status === "Active").length;

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="h-14 w-1/3 bg-slate-200/50 animate-pulse rounded-lg" />
        
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200/50 animate-pulse rounded-2xl border border-slate-200/50" />
          ))}
        </div>
        
        {/* Table Skeleton */}
        <div className="h-64 bg-slate-200/50 animate-pulse rounded-2xl border border-slate-200/50" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Landmark className="text-blue-600" size={24} />
            ภาพรวมระบบบริหารจัดการ (Executive Dashboard)
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            ข้อมูลแบบเรียลไทม์ของระบบบัญชีลูกค้าและรายการธุรกรรม WAVY BANK
          </p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Assets */}
        <Card className="hover:shadow-md relative overflow-hidden" elevated>
          <div className="absolute top-0 inset-x-0 h-[2px] bg-[#0A2540]" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">มูลค่าสินทรัพย์รวม (Total Assets)</p>
          <p className="text-2xl font-black text-slate-800 mt-2.5">฿{totalAssets.toLocaleString()}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">สกุลเงินบาท (THB)</span>
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm">
              <Wallet size={16} />
            </div>
          </div>
        </Card>

        {/* Total Accounts */}
        <Card className="hover:shadow-md relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-slate-400" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">บัญชีลูกค้าทั้งหมด (Total Accounts)</p>
          <p className="text-2xl font-black text-slate-800 mt-2.5">{clients.length} รายการ</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">ลงทะเบียนสำเร็จ</span>
            <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-500 border border-slate-200">
              <Users size={16} />
            </div>
          </div>
        </Card>

        {/* Active Clients */}
        <Card className="hover:shadow-md relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-emerald-600" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">ลูกค้าปกติ (Active Clients)</p>
          <p className="text-2xl font-black text-slate-800 mt-2.5">{activeClients} บัญชี</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">ใช้งานระบบได้ตามปกติ</span>
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 border border-emerald-100">
              <Activity size={16} />
            </div>
          </div>
        </Card>

        {/* Recent TX Count */}
        <Card className="hover:shadow-md relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-indigo-600" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">ธุรกรรมล่าสุด (Recent TX)</p>
          <p className="text-2xl font-black text-slate-800 mt-2.5">{transactions.length} รายการ</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">ประวัติสัปดาห์นี้</span>
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 border border-indigo-100">
              <ArrowLeftRight size={16} />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Transactions Section */}
      <Card noPadding className="overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-600" />
            <h2 className="text-sm font-bold text-slate-800">บันทึกธุรกรรมล่าสุดในระบบ</h2>
          </div>
          <span className="text-xs text-slate-400 font-bold">อัปเดตอัตโนมัติ</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3.5 text-xs font-bold text-slate-550 uppercase tracking-wider">วัน-เวลาทำรายการ</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-550 uppercase tracking-wider">บัญชีต้นทาง (From)</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-550 uppercase tracking-wider">บัญชีปลายทาง (To)</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-550 uppercase tracking-wider">ประเภท</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-550 uppercase tracking-wider text-right">จำนวนเงิน (บาท)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((t) => (
                <tr key={t.id} className="bank-table-row">
                  <td className="px-6 py-4 text-xs font-bold text-slate-500">
                    {new Date(t.created_at).toLocaleString("th-TH")}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs font-bold text-slate-600">
                    {t.sender_account ?? "—"}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs font-bold text-slate-600">
                    {t.receiver_account ?? "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                      t.type === "Deposit"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : t.type === "Withdraw"
                        ? "bg-rose-50 text-rose-700 border-rose-100"
                        : "bg-blue-50 text-blue-700 border-blue-100"
                    }`}>
                      {t.type === "Deposit" ? "ฝากเงิน" : t.type === "Withdraw" ? "ถอนเงิน" : "โอนเงิน"}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm font-bold text-right ${
                    t.type === "Deposit" ? "text-emerald-600" : t.type === "Withdraw" ? "text-rose-600" : "text-blue-600"
                  }`}>
                    {t.type === "Withdraw" ? "-" : "+"}฿{Number(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ArrowLeftRight size={36} className="text-slate-300" />
                      <p className="text-sm font-bold text-slate-400">ยังไม่มีรายการธุรกรรมที่ถูกจัดทำขึ้นในระบบ</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
