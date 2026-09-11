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
  Database,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface UserProfile {
  id: number;
  email: string;
  role: "ADMIN" | "MEMBER";
  first_name: string;
  last_name: string;
}

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setUser(json.data.user);
          setUnreadCount(json.data.unreadNotifications || 0);
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
    } catch {
      router.push("/login");
    }
  };

  const memberLinks = [
    { href: "/portal", label: "หน้าหลักบัญชี", icon: LayoutDashboard },
    { href: "/portal/transfer", label: "โอนเงิน", icon: ArrowLeftRight },
    { href: "/portal/transactions", label: "ประวัติรายการ", icon: CreditCard },
  ];

  const adminLinks = [
    { href: "/admin", label: "ภาพรวมผู้บริหาร & ฐานข้อมูล", icon: LayoutDashboard },
    { href: "/admin/users", label: "จัดการสมาชิก", icon: Users },
    { href: "/admin/accounts", label: "จัดการบัญชี", icon: CreditCard },
    { href: "/admin/audit-logs", label: "Audit Logs", icon: ClipboardList },
  ];

  const navLinks = user?.role === "ADMIN" ? adminLinks : memberLinks;

  return (
    <nav className="fixed top-0 inset-x-0 z-40 bg-white/95 border-b border-slate-200 shadow-sm backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link
              href={user?.role === "ADMIN" ? "/admin" : user ? "/portal" : "/login"}
              className="flex items-center gap-2.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition-colors">
                <ShieldCheck size={22} className="text-white stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black tracking-tight text-slate-900 flex items-center gap-1">
                  APEX <span className="text-blue-600">BANK</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  Digital Banking
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            {user && (
              <div className="hidden md:flex items-center space-x-1">
                {navLinks.map(({ href, label, icon: Icon }) => {
                  const isActive = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? "text-blue-600 bg-blue-50 font-extrabold"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                      }`}
                    >
                      <Icon size={16} />
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Header Area */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifs(!showNotifs);
                      if (!showNotifs) fetchNotifications();
                    }}
                    className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white font-mono text-[10px] font-bold flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown */}
                  {showNotifs && (
                    <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 divide-y divide-slate-100 animate-fade-in">
                      <div className="flex items-center justify-between pb-2 px-1">
                        <span className="text-xs font-bold text-slate-800">การแจ้งเตือน</span>
                        <span className="text-[10px] text-slate-500">{unreadCount} รายการใหม่</span>
                      </div>
                      {notifications.length === 0 ? (
                        <div className="py-6 text-center text-xs text-slate-400">
                          ไม่มีการแจ้งเตือนใหม่
                        </div>
                      ) : (
                        notifications.slice(0, 8).map((n: any) => (
                          <div key={n.id} className="p-2.5 hover:bg-slate-50 rounded-xl transition-colors">
                            <p className="text-xs font-bold text-slate-800">{n.title}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* User Pill */}
                <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    <User size={14} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800 leading-tight">
                      {user.first_name} {user.last_name}
                    </span>
                    <span className="text-[10px] font-bold text-blue-600 font-mono uppercase">
                      {user.role}
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  title="ออกจากระบบ"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                >
                  <LogOut size={15} />
                  <span className="hidden sm:inline">ออกจากระบบ</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/20 transition-all"
              >
                เข้าสู่ระบบ
              </Link>
            )}

            {/* Mobile menu toggle */}
            {user && (
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200"
              >
                {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {showMobileMenu && user && (
          <div className="md:hidden py-3 border-t border-slate-200 space-y-1 bg-white">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                <Icon size={16} />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
