// app/settings/page.tsx
"use client";
import { useEffect, useState } from "react";
import Card from "@/app/components/Card";
import Button from "@/app/components/Button";
import { Settings, Shield, RotateCcw, AlertTriangle, Info } from "lucide-react";

export default function SettingsPage() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    setIsAdmin(localStorage.getItem("isAdmin") === "true");
  }, []);

  const toggleAdmin = () => {
    const newVal = !isAdmin;
    setIsAdmin(newVal);
    if (newVal) localStorage.setItem("isAdmin", "true");
    else localStorage.removeItem("isAdmin");
  };

  const resetData = () => {
    if (confirm("⚠️ ต้องการลบข้อมูลลูกค้า รายการธุรกรรม และข้อมูลตั้งค่าทั้งหมดและรีเซ็ตระบบกลับสู่ค่าเริ่มต้นใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้!")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <Settings className="text-sky-400" size={24} />
            ตั้งค่าระบบควบคุม (System Settings)
          </h1>
          <p className="text-xs font-semibold text-slate-400 mt-1">
            ปรับเปลี่ยนโหมดการเข้าใช้งาน ตรวจสอบระบบรักษาความปลอดภัย และจัดการข้อมูล
          </p>
        </div>
      </div>

      {/* Admin Mode Toggle */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[2px] bg-sky-500" />
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-sky-950/40 rounded-xl flex items-center justify-center text-sky-400 border border-sky-900/30 flex-shrink-0">
            <Shield size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-slate-100 mb-1">โหมดผู้ดูแลระบบ (Admin Access Control)</h3>
            <p className="text-xs font-semibold text-slate-400 mb-4">
              เปิดใช้งานสิทธิ์บัญชีผู้ใช้ดูแลระบบหลัก หากปิดใช้งานระบบจะไม่ผ่านการตรวจสอบสิทธิ์
            </p>
            
            <label className="inline-flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  id="admin-toggle"
                  checked={isAdmin}
                  onChange={toggleAdmin}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 rounded-full bg-slate-850 border border-slate-800 peer-checked:bg-sky-500 transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform peer-checked:translate-x-5" />
              </div>
              <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition-colors">
                {isAdmin ? "สิทธิ์การเข้าใช้งานแบบแอดมิน: เปิด" : "สิทธิ์การเข้าใช้งานแบบแอดมิน: ปิด"}
              </span>
            </label>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="border-rose-900/40 bg-rose-950/5 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[2px] bg-rose-500" />
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-rose-950/40 rounded-xl flex items-center justify-center text-rose-400 border border-rose-900/30 flex-shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-rose-300 mb-1">พื้นที่ล้างข้อมูลระบบ (System Danger Zone)</h3>
            <p className="text-xs font-semibold text-slate-400 mb-4 leading-relaxed">
              การสั่งล้างข้อมูลระบบจะทำการ **ลบข้อมูลผู้ลงทะเบียนและประวัติการเงินทั้งหมด** รวมถึงรหัสควบคุมสิทธิ์ออกจากแคชของเบราว์เซอร์ เพื่อความปลอดภัยของข้อมูล
            </p>
            <Button variant="danger" onClick={resetData} className="flex items-center gap-1.5 font-bold">
              <RotateCcw size={14} />
              สั่งล้างและตั้งค่าระบบธนาคารใหม่ทั้งหมด
            </Button>
          </div>
        </div>
      </Card>

      {/* App Info */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-slate-900/50 rounded-xl flex items-center justify-center text-slate-350 border border-slate-800/80 flex-shrink-0">
            <Info size={20} />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-100 mb-1">เกี่ยวกับซอฟต์แวร์ (Software Specification)</h3>
            <div className="space-y-1.5 text-xs text-slate-450 font-semibold font-mono">
              <p>ชื่อระบบ: <span className="text-slate-300">WAVY BANK — Secure Digital Banking Portal</span></p>
              <p>เวอร์ชันผลิตภัณฑ์: <span className="text-slate-300">v1.2.0 (Tailwind Dark Mode Optimized)</span></p>
              <p>ระบบการจัดเก็บ: <span className="text-sky-400">Client-Side Secure Web Storage (AES-compatible)</span></p>
              <p className="text-[10px] text-slate-500">ระบบนี้ถูกออกแบบมาเพื่อควบคุมการบริหารข้อมูลอย่างสมบูรณ์แบบโดยพนักงานธนาคารเท่านั้น</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
