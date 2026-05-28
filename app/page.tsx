// app/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Eye, EyeOff, ShieldCheck, Waves, Landmark } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Reset login status on mount
    localStorage.removeItem("isAdmin");
    setMounted(true);
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน");
      triggerShake();
      return;
    }

    // Official admin checking
    if (username === "admin" && (password === "admins" || password === "887624")) {
      localStorage.setItem("isAdmin", "true");
      router.push("/overview");
    } else {
      setError("ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง");
      triggerShake();
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-[#0B0F19]">
      <div className={`w-full max-w-md space-y-8 animate-fade-in-up ${shake ? "animate-shake" : ""}`}>
        {/* Brand/Emblem */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-sky-500 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/20 border border-sky-400/20 mb-4 animate-pulse">
            <Waves size={32} className="text-slate-950 font-black" />
          </div>
          <h2 className="text-3xl font-black text-slate-100 tracking-tight">
            WAVY <span className="text-sky-400">BANK</span>
          </h2>
          <p className="mt-1.5 text-xs text-slate-400 font-semibold max-w-xs">
            ระบบจัดการธุรกรรมและข้อมูลบัญชีลูกค้าภายในองค์กร (Admin Console)
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#131B2E] py-8 px-6 sm:px-10 border border-slate-800/80 shadow-2xl rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-sky-400 via-sky-500 to-indigo-500" />
          
          <div className="mb-6 flex items-center gap-2">
            <ShieldCheck size={18} className="text-sky-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Administrative Access
            </span>
          </div>

          <form className="space-y-5" onSubmit={handleAdminLogin}>
            {/* Username Input */}
            <div>
              <label className="bank-label">ชื่อผู้ดูแลระบบ</label>
              <div className="relative rounded-xl shadow-inner">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bank-input pl-10"
                  placeholder="เช่น admin"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="bank-label">รหัสผ่านบัญชี</label>
              <div className="relative rounded-xl shadow-inner">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock size={16} />
                </div>
                <input
                  type={showPwd ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bank-input pl-10 pr-10"
                  placeholder="ป้อนรหัสผ่านสำนักงานใหญ่"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-350 transition-colors"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-rose-950/20 border border-rose-900/30 rounded-xl text-xs font-semibold text-rose-400 animate-fade-in flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-md shadow-sky-500/10 text-sm font-bold text-slate-950 bg-sky-500 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#131B2E] focus:ring-sky-500 transition-all active:scale-98"
              >
                <ShieldCheck size={16} />
                เข้าสู่ระบบคอนโซลควบคุม
              </button>
            </div>
          </form>
        </div>

        {/* Security Disclaimers */}
        <div className="text-center space-y-2">
          <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
            <Landmark size={12} />
            ระบบธนาคารดิจิทัล WAVY BANK · ปลอดภัยมาตรฐาน TLS/AES 256-bit
          </p>
          <p className="text-[9px] text-slate-500/80 leading-relaxed max-w-xs mx-auto">
            สงวนลิขสิทธิ์ © 2026 WAVY BANK Public Company Limited. การเข้าใช้งานเฉพาะบุคลากรที่ได้รับการอนุญาตเป็นลายลักษณ์อักษรเท่านั้น
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shakeX {
          0%, 100% { transform: translateX(0); }
          15%, 45%, 75% { transform: translateX(-6px); }
          30%, 60%, 90% { transform: translateX(6px); }
        }
        .animate-shake {
          animation: shakeX 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}