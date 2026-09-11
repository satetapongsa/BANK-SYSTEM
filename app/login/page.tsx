// app/login/page.tsx
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Phone, User, ArrowRight, AlertCircle, Sparkles, KeyRound } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [roleMode, setRoleMode] = useState<"MEMBER" | "ADMIN">("MEMBER");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
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
        throw new Error(json.error?.message || "เข้าสู่ระบบไม่สำเร็จ");
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

  const fillAdmin = () => {
    setRoleMode("ADMIN");
    setIdentifier("admin");
    setPassword("admin");
    handleLogin("admin", "admin");
  };

  const fillMember = () => {
    setRoleMode("MEMBER");
    setIdentifier("089-123-4567");
    setPassword("123456");
    handleLogin("089-123-4567", "123456");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Brand Banner */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-3">
            <ShieldCheck size={32} className="text-white stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            APEX <span className="text-blue-600">BANK</span>
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            ระบบธนาคารดิจิทัลที่ปลอดภัย ใช้งานง่าย สะอาด เป็นระเบียบ
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl">
          {/* Quick 1-Click Login Bar */}
          <div className="mb-6 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
              <Sparkles size={14} className="text-blue-600" />
              <span>คลิกเดียวเข้าสู่ระบบด่วน (Demo Accounts):</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={fillAdmin}
                disabled={isLoading}
                className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold transition-all text-center"
              >
                👑 แอดมิน (admin / admin)
              </button>
              <button
                type="button"
                onClick={fillMember}
                disabled={isLoading}
                className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold transition-all text-center"
              >
                👤 ผู้ใช้ทั่วไป (Somchai)
              </button>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 mb-6">
            <button
              type="button"
              onClick={() => {
                setRoleMode("MEMBER");
                setIdentifier("");
                setPassword("");
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                roleMode === "MEMBER"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ลูกค้าบุคคล (Member)
            </button>
            <button
              type="button"
              onClick={() => {
                setRoleMode("ADMIN");
                setIdentifier("admin");
                setPassword("admin");
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                roleMode === "ADMIN"
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ผู้ดูแลระบบ (Admin)
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-4"
          >
            {roleMode === "MEMBER" ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  เบอร์โทรศัพท์ (Phone Number) หรือ อีเมล
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="เช่น 089-123-4567 หรืออีเมล"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ชื่อผู้ใช้แอดมิน (Username)
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="admin"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-purple-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-xl text-white font-bold text-xs shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 mt-2 disabled:opacity-50 ${
                roleMode === "ADMIN"
                  ? "bg-purple-600 hover:bg-purple-700 shadow-purple-500/20"
                  : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
              }`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>เข้าสู่ระบบ</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
