// app/login/page.tsx
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Mail, User, Phone, ArrowRight, AlertCircle, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const handleLogin = async (loginEmail?: string, loginPassword?: string) => {
    setError(null);
    setIsLoading(true);
    const targetEmail = loginEmail || email;
    const targetPassword = loginPassword || password;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, password: targetPassword }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "ไม่สามารถเข้าสู่ระบบได้");
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          phone,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "ไม่สามารถลงทะเบียนได้");
      }

      router.push("/portal");
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการลงทะเบียน");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md">
        {/* Brand Banner */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-cyan-500/20 mb-4 ring-4 ring-cyan-500/10">
            <ShieldCheck size={36} className="text-slate-950 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-100">
            APEX <span className="text-cyan-400">BANK</span>
          </h1>
          <p className="text-xs font-medium text-slate-400 mt-1 max-w-xs">
            แพลตฟอร์มบริหารการเงินและธนาคารดิจิทัลระดับองค์กรที่ปลอดภัย
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          {/* Quick Demo Credentials Bar */}
          <div className="mb-6 p-3.5 rounded-2xl bg-slate-950/70 border border-cyan-800/40">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 mb-2">
              <Sparkles size={14} />
              <span>เข้าสู่ระบบด่วนสำหรับการทดสอบ (Demo Accounts)</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleLogin("admin@apexbank.com", "Password123!")}
                disabled={isLoading}
                className="px-3 py-2 text-[11px] font-bold rounded-xl bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 hover:bg-cyan-900/80 transition-all text-left truncate"
              >
                👑 Admin เข้าสู่ระบบ
              </button>
              <button
                type="button"
                onClick={() => handleLogin("somchai@apexbank.com", "Password123!")}
                disabled={isLoading}
                className="px-3 py-2 text-[11px] font-bold rounded-xl bg-blue-950/80 border border-blue-700/60 text-blue-300 hover:bg-blue-900/80 transition-all text-left truncate"
              >
                👤 Member (Somchai)
              </button>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 mb-6">
            <button
              onClick={() => {
                setTab("login");
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                tab === "login"
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              เข้าสู่ระบบ (Sign In)
            </button>
            <button
              onClick={() => {
                setTab("register");
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                tab === "register"
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              เปิดบัญชีใหม่ (Sign Up)
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {tab === "login" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  อีเมล (Email)
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@apexbank.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  รหัสผ่าน (Password)
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>เข้าสู่ระบบ</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ชื่อจริง
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="สมชาย"
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
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="ใจดี"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  เบอร์โทรศัพท์
                </label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="089-123-4567"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  อีเมล
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="somchai@apexbank.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <p className="text-[11px] text-cyan-400/90 font-medium">
                🎁 สมาชิกใหม่รับสิทธิ์เปิดบัญชีออมทรัพย์ฟรีพร้อมเงินประเดิม ฿1,000.00 บาททันที
              </p>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>ยืนยันเปิดบัญชีสมาชิก</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
