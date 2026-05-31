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
    <nav className="fixed top-0 inset-x-0 z-40 bg-white/95 border-b border-slate-200/80 shadow-sm backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-6">
            <Link
              href="/overview"
              className="flex items-center gap-2 group transition-opacity hover:opacity-90"
            >
              <div className="w-9 h-9 bg-[#0A2540] rounded-lg flex items-center justify-center shadow-sm">
                <Waves size={20} className="text-white font-black" />
              </div>
              <span className="text-base font-bold text-slate-800 tracking-tight">
                WAVY <span className="text-blue-600">BANK</span>
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
                        ? "text-blue-700 border-b-2 border-blue-600 rounded-b-none bg-blue-50/30"
                        : "text-slate-500 hover:text-slate-950 hover:bg-slate-50"
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
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-555 leading-none">ผู้ดูแลระบบ (Admin)</p>
                <span className="text-[9px] text-emerald-600 font-bold block mt-0.5">Console Online</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-100"
              title="ออกจากระบบ"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation bottom drawer for responsive ease */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white/98 border-t border-slate-200 shadow-2xl px-2 py-1 flex justify-around z-40 backdrop-blur-md">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname?.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-lg text-xs font-bold ${
                isActive ? "text-blue-700 bg-blue-50" : "text-slate-500 hover:text-slate-900"
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
