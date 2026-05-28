// app/components/NavBar.tsx
"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, ArrowLeftRight, Settings, Waves, LogOut } from "lucide-react";

const links = [
  { href: "/overview", label: "ภาพรวมระบบ", icon: LayoutDashboard },
  { href: "/clients", label: "จัดการบัญชีลูกค้า", icon: Users },
  { href: "/transactions", label: "บันทึกธุรกรรม", icon: ArrowLeftRight },
  { href: "/settings", label: "ตั้งค่าระบบ", icon: Settings },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  // If on login page, do not render navigation bar at all
  if (pathname === "/") return null;

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    router.push("/");
  };

  return (
    <nav className="fixed top-0 inset-x-0 z-40 bg-[#0B0F19]/90 border-b border-slate-800/80 shadow-lg backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-6">
            <Link
              href="/overview"
              className="flex items-center gap-2 group transition-opacity hover:opacity-90"
            >
              <div className="w-9 h-9 bg-sky-500 rounded-lg flex items-center justify-center shadow-md shadow-sky-500/10">
                <Waves size={20} className="text-slate-950 font-black" />
              </div>
              <span className="text-base font-bold text-slate-100 tracking-tight">
                WAVY <span className="text-sky-400">BANK</span>
              </span>
            </Link>

            {/* Middle: Navigation Links */}
            <div className="hidden md:flex items-center space-x-1 h-full pt-1">
              {links.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || pathname?.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`inline-flex items-center gap-2 px-4 h-12 rounded-lg text-sm font-bold transition-all ${
                      isActive
                        ? "bg-slate-800/60 text-sky-400 border-b-2 border-sky-500 rounded-b-none"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/30"
                    }`}
                  >
                    <Icon size={16} />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right: User Profile & Logout */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-[#131B2E] rounded-xl border border-slate-800/50">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-400 leading-none">ผู้ดูแลระบบ (Admin)</p>
                <span className="text-[9px] text-emerald-400 font-bold block mt-0.5">Console Online</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 rounded-xl transition-colors border border-transparent hover:border-rose-900/30"
              title="ออกจากระบบ"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation bottom drawer for responsive ease */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-[#0B0F19]/95 border-t border-slate-800/80 shadow-2xl px-2 py-1 flex justify-around z-40 backdrop-blur-md">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname?.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-lg text-xs font-bold ${
                isActive ? "text-sky-400 bg-sky-950/30" : "text-slate-400 hover:text-slate-100"
              }`}
            >
              <Icon size={18} />
              <span className="text-[9px] font-semibold">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
