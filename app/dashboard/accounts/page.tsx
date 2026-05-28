"use client";
import { useEffect, useState } from "react";
import * as storage from "@/app/lib/storage";
import { useRouter } from "next/navigation";
import {
  Search, Settings, ShieldCheck, ShieldAlert, LayoutDashboard,
  Users, ChevronRight, Landmark, SlidersHorizontal, TrendingUp
} from "lucide-react";

export default function AccountsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = storage.getClients();
    setClients(data);
    setLoading(false);
  }, []);

  const filtered = clients.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                        c.account_number.includes(search) ||
                        (c.email || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalBalance = clients.reduce((s, c) => s + Number(c.balance), 0);
  const activeCount = clients.filter(c => c.status === 'Active').length;
  const blockedCount = clients.filter(c => c.status === 'Blocked').length;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#080c14' }}>
      <div className="animated-bg grid-bg" />

      {/* Sidebar */}
      <aside className="relative z-20 w-64 flex flex-col flex-shrink-0"
             style={{ background: 'rgba(8,12,20,0.95)', borderRight: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}>
        <div className="p-5 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
            <Landmark size={18} className="text-white" />
          </div>
          <div>
            <span className="font-black text-sm tracking-wide" style={{ color: '#f0f6fc' }}>WAVY BANK</span>
            <p className="text-xs" style={{ color: '#484f58' }}>Admin Console</p>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <a href="/dashboard" className="sidebar-link">
            <LayoutDashboard size={18} /> Overview
          </a>
          <a href="/dashboard/accounts" className="sidebar-link active">
            <Users size={18} /> All Accounts
          </a>
        </nav>
      </aside>

      {/* Main */}
      <main className="relative z-10 flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 flex justify-between items-center px-8"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(8,12,20,0.8)', backdropFilter: 'blur(20px)' }}>
          <div>
            <h1 className="text-lg font-black" style={{ color: '#f0f6fc' }}>Account Registry</h1>
            <p className="text-xs" style={{ color: '#484f58' }}>{clients.length} total clients</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          
          {/* Mini Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'TOTAL ASSETS', value: `฿${totalBalance.toLocaleString()}`, color: '#4f9cf9' },
              { label: 'ACTIVE', value: activeCount, color: '#3fb950' },
              { label: 'BLOCKED', value: blockedCount, color: '#f85149' },
            ].map(s => (
              <div key={s.label} className="glass rounded-2xl p-5 card-hover">
                <p className="text-xs font-bold tracking-widest mb-2" style={{ color: '#484f58' }}>{s.label}</p>
                <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Search + Filter */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#484f58' }} />
              <input
                placeholder="ค้นหาด้วยชื่อ, เลขบัญชี, อีเมล..."
                className="input-dark pl-14"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {['All', 'Active', 'Blocked'].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                        className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                        style={{
                          background: filterStatus === s ? 'rgba(79,156,249,0.15)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${filterStatus === s ? 'rgba(79,156,249,0.3)' : 'rgba(255,255,255,0.08)'}`,
                          color: filterStatus === s ? '#4f9cf9' : '#8b949e'
                        }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="glass rounded-2xl overflow-hidden">
            <table className="w-full table-dark">
              <thead>
                <tr>
                  {['Account No.', 'Name', 'Email', 'Balance', 'Status', 'Action'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-bold tracking-widest" style={{ color: '#484f58' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(6)].map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="skeleton h-4 rounded" style={{ width: [160, 120, 180, 80, 60, 80][j] }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-sm" style={{ color: '#484f58' }}>
                      {search ? `ไม่พบผลลัพธ์สำหรับ "${search}"` : 'ยังไม่มีลูกค้าในระบบ'}
                    </td>
                  </tr>
                ) : filtered.map((client, i) => (
                  <tr key={client.id} className="">
                    <td className="px-6 py-4 font-mono text-xs" style={{ color: '#4f9cf9' }}>{client.account_number}</td>
                    <td className="px-6 py-4 font-bold text-sm" style={{ color: '#f0f6fc' }}>{client.name}</td>
                    <td className="px-6 py-4 text-xs" style={{ color: '#8b949e' }}>{client.email || '—'}</td>
                    <td className="px-6 py-4 font-bold text-sm" style={{ color: '#f0f6fc' }}>
                      ฿{Number(client.balance).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1.5 text-xs font-bold w-fit px-2.5 py-1 rounded-full ${client.status === 'Active' ? 'status-badge-active' : 'status-badge-blocked'}`}>
                        {client.status === 'Active' ? <><ShieldCheck size={12} /> Active</> : <><ShieldAlert size={12} /> Blocked</>}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => router.push(`/dashboard/manage/${client.id}`)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all btn-shimmer"
                              style={{ background: 'rgba(79,156,249,0.1)', border: '1px solid rgba(79,156,249,0.2)', color: '#4f9cf9' }}>
                        <Settings size={13} /> Manage <ChevronRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}