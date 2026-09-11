// app/login/page.tsx
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Eye, EyeOff, AlertCircle, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (customId?: string, customPass?: string) => {
    setError(null);
    setIsLoading(true);
    const finalId = customId !== undefined ? customId : identifier;
    const finalPass = customPass !== undefined ? customPass : password;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: finalId, password: finalPass }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "เข้าสู่ระบบไม่สำเร็จ ตรวจสอบข้อมูลแล้วลองอีกครั้ง");
      }

      const role = json.data?.user?.role;
      if (role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/portal");
      }
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = (id: string, pass: string) => {
    setIdentifier(id);
    setPassword(pass);
    handleLogin(id, pass);
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-8 bg-slate-50">
      {/* Google-Style Container Card */}
      <div className="w-full max-w-[440px] bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-10 shadow-sm">
        {/* Brand Logo & Title */}
        <div className="flex flex-col items-start mb-7">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Shield size={22} className="stroke-[2.5]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">
              APEX <span className="text-blue-600">BANK</span>
            </span>
          </div>

          <h1 className="text-2xl font-normal text-slate-900 tracking-tight">
            ลงชื่อเข้าใช้
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            ใช้บัญชี APEX Bank ของคุณ
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 text-red-600 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="space-y-6"
        >
          {/* Identifier Input */}
          <div className="relative">
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              อีเมล เบอร์โทรศัพท์ หรือ ชื่อผู้ใช้
            </label>
            <input
              type="text"
              required
              autoFocus
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="เช่น 089-123-4567 หรือ admin"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors bg-white"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-700">
                รหัสผ่าน
              </label>
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
              >
                {showPassword ? (
                  <>
                    <EyeOff size={13} />
                    <span>ซ่อนรหัส</span>
                  </>
                ) : (
                  <>
                    <Eye size={13} />
                    <span>แสดงรหัส</span>
                  </>
                )}
              </button>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="ป้อนรหัสผ่านของคุณ"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors bg-white"
            />
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                alert("สำหรับบัญชีตัวอย่าง:\n- แอดมิน: admin / admin\n- สมาชิก: 089-123-4567 / 123456");
              }}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline py-1.5"
            >
              ต้องการความช่วยเหลือ?
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>เข้าสู่ระบบ</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Test Shortcuts (Clean Google-Style Footnote) */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-500 mb-2.5 font-medium">
            ทางลัดทดสอบระบบ (คลิกเพื่อเข้าสู่ระบบทันที):
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => quickLogin("admin", "admin")}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200/60 flex items-center gap-1.5"
            >
              <span>👑 เข้าเป็น Admin</span>
              <span className="text-[11px] text-slate-400 font-mono">(admin)</span>
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => quickLogin("089-123-4567", "123456")}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors border border-blue-100 flex items-center gap-1.5"
            >
              <span>👤 เข้าเป็นผู้ใช้ (Somchai)</span>
              <span className="text-[11px] text-blue-400 font-mono">(089...)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 text-center text-xs text-slate-400">
        APEX Digital Banking Platform • มาตรฐานความปลอดภัยระดับองค์กร
      </div>
    </div>
  );
}
