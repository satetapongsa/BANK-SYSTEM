"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Lock, User, LogIn, Loader2, Landmark, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [shake, setShake] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    localStorage.removeItem("isAdmin");
    setMounted(true);
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && (password === "admins" || password === "887624")) {
      localStorage.setItem("isAdmin", "true");
      window.location.href = "/dashboard";
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/user` },
    });
    if (error) {
      alert(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Animated Background */}
      <div className="animated-bg grid-bg" />

      {/* Floating Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div style={{
          position: 'absolute', top: '15%', left: '10%', width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(79,156,249,0.08) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(40px)',
          animation: 'bgPulse 8s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', right: '15%', width: 250, height: 250,
          background: 'radial-gradient(circle, rgba(63,185,80,0.06) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(40px)',
          animation: 'bgPulse 12s ease-in-out infinite reverse'
        }} />
      </div>

      {/* Login Card */}
      <div className={`relative z-10 w-full max-w-md ${mounted ? 'animate-fade-up' : 'opacity-0'}`}>
        
        {/* Logo Section */}
        <div className="text-center mb-8 opacity-0 animate-fade-up stagger-1" style={{ animationFillMode: 'forwards' }}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 animate-pulse-glow"
               style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', boxShadow: '0 8px 32px rgba(59,130,246,0.4)' }}>
            <Landmark size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-glow-blue" style={{ color: '#f0f6fc' }}>
            WAVY BANK
          </h1>
          <p className="text-sm mt-1" style={{ color: '#8b949e' }}>
            Secure Digital Banking Platform
          </p>
        </div>

        {/* Card */}
        <div className={`glass rounded-2xl p-8 ${shake ? 'animate-[shakeX_0.5s_ease]' : ''}`}
             style={{ boxShadow: '0 8px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(79,156,249,0.1)' }}>

          {/* Admin Form */}
          <div className="mb-6 opacity-0 animate-fade-up stagger-2" style={{ animationFillMode: 'forwards' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#8b949e' }}>
              Administrator Access
            </p>
            <form onSubmit={handleAdminLogin} className="space-y-3">
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#484f58' }} />
                <input
                  type="text"
                  placeholder="Username"
                  className="input-dark pl-10"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#484f58' }} />
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="Password"
                  className="input-dark pl-10 pr-12"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                        style={{ color: '#484f58' }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button type="submit"
                      className="w-full btn-shimmer font-bold py-3 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2"
                      style={{
                        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#f0f6fc',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(79,156,249,0.4)';
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(79,156,249,0.2)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)';
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.4)';
                      }}>
                <ShieldCheck size={16} />
                Admin Login
              </button>
            </form>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5 opacity-0 animate-fade-up stagger-3" style={{ animationFillMode: 'forwards' }}>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <span className="text-xs font-bold tracking-widest" style={{ color: '#484f58' }}>OR CUSTOMER</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>

          {/* Google Button */}
          <div className="opacity-0 animate-fade-up stagger-4" style={{ animationFillMode: 'forwards' }}>
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full btn-shimmer flex items-center justify-center gap-3 py-3 rounded-xl font-bold text-sm transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#f0f6fc',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.15)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)';
              }}
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              {loading ? "กำลังเชื่อมต่อ..." : "เข้าสู่ระบบด้วย Google"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs mt-6 opacity-0 animate-fade-up stagger-5" 
           style={{ color: '#484f58', animationFillMode: 'forwards' }}>
          🔒 Protected by 256-bit TLS Encryption · WAVY BANK © 2025
        </p>
      </div>

      <style>{`
        @keyframes shakeX {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
          20%, 40%, 60%, 80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}