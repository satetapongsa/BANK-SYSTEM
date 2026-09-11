// app/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function IndexPage() {
  const router = useRouter();

  useEffect(() => {
    async function checkAuthAndRedirect() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.user) {
            if (json.data.user.role === "ADMIN") {
              router.replace("/admin");
              return;
            } else {
              router.replace("/portal");
              return;
            }
          }
        }
      } catch {}
      router.replace("/login");
    }

    checkAuthAndRedirect();
  }, [router]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-mono font-semibold text-slate-400">
        กำลังเชื่อมต่อระบบความปลอดภัย APEX Digital Banking...
      </p>
    </div>
  );
}