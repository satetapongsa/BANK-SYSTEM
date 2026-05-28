// app/components/NavBar.tsx
"use client";
import Link from "next/link";
import { Home, Users, CreditCard, Settings } from "lucide-react";

export default function NavBar() {
  return (
    <nav className="glass fixed top-4 left-1/2 -translate-x-1/2 z-20 w-auto px-4 py-2 rounded-full flex items-center gap-6 shadow-lg">
      <Link href="/overview" className="flex items-center gap-1 text-sm font-medium text-primary hover:text-white transition-colors">
        <Home size={16} /> Overview
      </Link>
      <Link href="/clients" className="flex items-center gap-1 text-sm font-medium text-primary hover:text-white transition-colors">
        <Users size={16} /> Clients
      </Link>
      <Link href="/transactions" className="flex items-center gap-1 text-sm font-medium text-primary hover:text-white transition-colors">
        <CreditCard size={16} /> Transactions
      </Link>
      <Link href="/settings" className="flex items-center gap-1 text-sm font-medium text-primary hover:text-white transition-colors">
        <Settings size={16} /> Settings
      </Link>
    </nav>
  );
}
