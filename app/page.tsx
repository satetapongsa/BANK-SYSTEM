// app/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function IndexPage() {
  const router = useRouter();

  useEffect(() => {
    // Instantly push to overview dashboard, removing login
    router.replace("/overview");
  }, [router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm font-semibold text-slate-500">กำลังนำเข้าสู่ระบบแดชบอร์ด WAVY BANK...</p>
    </div>
  );
}