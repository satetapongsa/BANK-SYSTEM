// app/components/NavBar.tsx
"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  CreditCard,
  ArrowLeftRight,
  ClipboardList,
  Bell,
  LogOut,
  Menu,
  X,
  User,
  CheckCircle2,
  AlertCircle,
  Database,
} from "lucide-react";

interface UserProfile {
  id: number;
  email: string;
  role: "ADMIN" | "MEMBER";
  first_name: string;
  last_name: string;
}

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [dbEngine, setDbEngine] = useState<string>("LOCAL_ACID_ENGINE");

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setUser(json.data.user);
          setUnreadCount(json.data.unreadNotifications || 0);
          setDbEngine(json.data.engine || "LOCAL_ACID_ENGINE");
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setNotifications(json.data.notifications || []);
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchSession();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/login");
    } catch (e) {
      router.push("/login");
    }
  };

  const handleMarkNotifRead = async (id: number) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  // Nav links based on role
  const memberLinks = [
    { href: "/portal", label: "ภาพรวมบัญชี", icon: LayoutDashboard },
    { href: "/portal/transfer", label: "โอนเงิน", icon: ArrowLeftRight },
    { href: "/portal/transactions", label: "ประวัติธุรกรรม", icon: CreditCard },
  ];

  const adminLinks = [
    { href: "/admin", label: "Dashboard ผู้บริหาร", icon: LayoutDashboard },
    { href: "/admin/users", label: "จัดการสมาชิก", icon: Users },
    { href: "/admin/accounts", label: "บัญชีธนาคาร", icon: CreditCard },
    { href: "/portal/transactions", label: "ธุรกรรมทั้งหมด", icon: ArrowLeftRight },
    { href: "/admin/audit-logs", label: "Audit Trail", icon: ClipboardList },
  ];

  const navLinks = user?.role === "ADMIN" ? adminLinks : memberLinks;

  return (
    <nav className="fixed top-0 inset-x-0 z-40 bg-slate-950/90 border-b border-slate-850/80 shadow-lg backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link
              href={user?.role === "ADMIN" ? "/admin" : user ? "/portal" : "/login"}
              className="flex items-center gap-2.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <ShieldCheck size={22} className="text-slate-950 font-black stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black tracking-tight text-slate-100 flex items-center gap-1">
                  APEX <span className="text-cyan-400">BANK</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
                  Digital Banking
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            {user && (
              <div className="hidden md:flex items-center space-x-1 h-full pt-0.5">
                {navLinks.map(({ href, label, icon: Icon }) => {
                  const isActive = pathname === href || pathname?.startsWith(href + "/");
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? "text-cyan-400 bg-cyan-950/40 border border-cyan-800/40"
                          : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/60"
                      }`}
                    >
                      <Icon size={15} />
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Header Area */}
          <div className="flex items-center gap-3">
            {/* Database Engine Tag */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
              <Database size={12} className={dbEngine === "NEON_POSTGRESQL" ? "text-emerald-400" : "text-cyan-400"} />
              <span>{dbEngine === "NEON_POSTGRESQL" ? "Neon Postgres" : "ACID Engine"}</span>
            </div>

            {user ? (
              <>
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifs(!showNotifs);
                      if (!showNotifs) fetchNotifications();
                    }}
                    className="relative p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-slate-800/60 transition-colors"
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 text-slate-950 font-mono text-[10px] font-black flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {showNotifs && (
                    <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 animate-fade-in divide-y divide-slate-800/60">
                      <div className="flex items-center justify-between pb-2 px-1">
                        <span className="text-xs font-bold text-slate-200">การแจ้งเตือน</span>
                        <span className="text-[10px] text-slate-400">
                          {unreadCount} รายการใหม่
                        </span>
                      </div>
                      {notifications.length === 0 ? (
                        <div className="py-6 text-center text-xs text-slate-500">
                          ไม่มีการแจ้งเตือนในขณะนี้
                        </div>
                      ) : (
                        notifications.slice(0, 10).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleMarkNotifRead(n.id)}
                            className={`p-2.5 hover:bg-slate-800/40 rounded-xl cursor-pointer transition-colors ${
                              !n.is_read ? "bg-slate-850/60" : ""
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {n.type === "SUCCESS" ? (
                                <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                              ) : (
                                <AlertCircle size={14} className="text-cyan-400 mt-0.5 shrink-0" />
                              )}
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-slate-200">{n.title}</p>
                                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{n.message}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* User Profile Pill */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                    <User size={14} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-200 leading-tight">
                      {user.first_name} {user.last_name}
                    </span>
                    <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase">
                      {user.role}
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  title="ออกจากระบบ"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-slate-800/60 transition-colors"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl shadow-md shadow-cyan-500/10 transition-all"
              >
                เข้าสู่ระบบ
              </Link>
            )}

            {/* Mobile Menu Button */}
            {user && (
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-slate-800/60"
              >
                {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {showMobileMenu && user && (
          <div className="md:hidden py-3 border-t border-slate-800/80 space-y-1">
            <div className="px-3 py-2 bg-slate-900/50 rounded-xl mb-2 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-200">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">{user.email}</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                {user.role}
              </span>
            </div>

            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "text-cyan-400 bg-cyan-950/40 border border-cyan-800/40"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                  }`}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </Link>
              );
            })}

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/30 transition-colors"
            >
              <LogOut size={16} />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
