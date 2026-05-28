"use client";
import { useState, useEffect } from "react";
import * as storage from "@/app/lib/storage";
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
    const { error } = await storage.simulateGoogleLogin();
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
      <div className={`relative z-10 w-full max-w-md ${mounted ? '' : 'opacity-0'}`}>
        
        {/* Logo Section */}
        <div className="text-center mb-8" style={{ animationFillMode: 'forwards' }}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
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
        <div className="glass rounded-2xl p-8"
             style={{ boxShadow: '0 8px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(79,156,249,0.1)' }}>

          {/* Admin Form */}
          <div className="mb-6" style={{ animationFillMode: 'forwards' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#8b949e' }}>
              Administrator Access
            </p>
            <form onSubmit={handleAdminLogin} className="space-y-3">
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#484f58' }} />
                <input
                  type="text"
                  placeholder="Username"
                  className="input-dark pl-12"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#484f58' }} />
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="Password"
                  className="input-dark pl-12 pr-12"
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
        </div>

        {/* Footer */}
        <p className="text-center text-xs mt-6" 
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