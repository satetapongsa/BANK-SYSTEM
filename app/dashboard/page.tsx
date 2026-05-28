"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  LayoutDashboard, Users, Banknote, LogOut,
  TrendingUp, Landmark, RefreshCw, AlertTriangle, ShieldCheck,
  Plus, X, ChevronRight, Activity, DollarSign, UserCheck
} from "lucide-react";

export default function Dashboard() {
  const [clients, setClients] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", balance: "" });
  const [showForm, setShowForm] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const adminKey = localStorage.getItem("isAdmin");
    if (adminKey) {
      setIsAdmin(true);
      fetchData();
    }
    setMounted(true);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from('clients').select('*').order('id', { ascending: false });
    if (data) setClients(data);
    setLoading(false);
  };

  const handleLogout = async () => {
    localStorage.clear();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.balance) return;
    const accNum = `101-0-${Math.floor(Math.random() * 89999 + 10000)}-${Math.floor(Math.random() * 9)}`;
    setClients([{ id: Date.now(), name: formData.name, account_number: accNum, balance: formData.balance, status: 'Active' }, ...clients]);
    setFormData({ name: "", email: "", balance: "" });
    setShowForm(false);
    await supabase.from('clients').insert([{
      name: formData.name,
      email: formData.email,
      account_number: accNum,
      balance: parseFloat(formData.balance),
      status: 'Active',
      region: 'Bangkok'
    }]);
    fetchData();
  };

  const totalAssets = clients.reduce((sum, c) => sum + Number(c.balance), 0);
  const activeUsers = clients.filter(c => c.status === 'Active').length;
  const blockedUsers = clients.filter(c => c.status === 'Blocked').length;

  if (!isAdmin) {
    return (
      <div className="h-screen flex flex-col items-center justify-center" style={{ background: '#080c14' }}>
        <div className="animated-bg grid-bg" />
        <div className="relative z-10 text-center animate-fade-scale">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6"
               style={{ background: 'rgba(248,81,73,0.1)', border: '2px solid rgba(248,81,73,0.3)' }}>
            <AlertTriangle size={48} style={{ color: '#f85149' }} />
          </div>
          <h1 className="text-4xl font-black mb-3" style={{ color: '#f85149' }}>Access Denied</h1>
          <p className="mb-8 text-sm" style={{ color: '#8b949e' }}>กรุณาเข้าสู่ระบบด้วยบัญชีผู้ดูแลระบบ</p>
          <a href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm btn-shimmer"
             style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#f0f6fc' }}>
            ← กลับไปหน้า Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#080c14' }}>
      <div className="animated-bg" />

      {/* Sidebar */}
      <aside className="relative z-20 w-64 flex flex-col flex-shrink-0"
             style={{ background: 'rgba(8,12,20,0.95)', borderRight: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}>
        
        <div className="p-5 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center animate-pulse-glow"
               style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
            <Landmark size={18} className="text-white" />
          </div>
          <div>
            <span className="font-black text-sm tracking-wide" style={{ color: '#f0f6fc' }}>WAVY BANK</span>
            <p className="text-xs" style={{ color: '#484f58' }}>Admin Console</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <a href="/dashboard" className="sidebar-link active">
            <LayoutDashboard size={18} /> Overview
          </a>
          <a href="/dashboard/accounts" className="sidebar-link">
            <Users size={18} /> All Accounts
          </a>
        </nav>

        <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black"
                 style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white' }}>A</div>
            <div>
              <p className="text-sm font-bold" style={{ color: '#f0f6fc' }}>Admin</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-blink" />
                <p className="text-xs" style={{ color: '#3fb950' }}>Online</p>
              </div>
            </div>
          </div>
          <button onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all"
                  style={{ background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.2)', color: '#f85149' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(248,81,73,0.16)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(248,81,73,0.08)')}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="relative z-10 flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 flex justify-between items-center px-8"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(8,12,20,0.8)', backdropFilter: 'blur(20px)' }}>
          <div>
            <h1 className="text-lg font-black" style={{ color: '#f0f6fc' }}>Executive Dashboard</h1>
            <p className="text-xs" style={{ color: '#484f58' }}>Real-time banking overview</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchData}
                    className="p-2.5 rounded-xl transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#8b949e' }}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm btn-shimmer"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white', boxShadow: '0 4px 16px rgba(59,130,246,0.3)' }}>
              <Plus size={16} /> Add Client
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                label: 'TOTAL ASSETS',
                value: `฿${totalAssets.toLocaleString()}`,
                sub: 'Thai Baht across all accounts',
                icon: DollarSign,
                color: '#3b82f6',
                delay: '0.05s'
              },
              {
                label: 'ACTIVE ACCOUNTS',
                value: activeUsers.toString(),
                sub: `${blockedUsers} blocked account${blockedUsers !== 1 ? 's' : ''}`,
                icon: UserCheck,
                color: '#3fb950',
                delay: '0.1s'
              },
              {
                label: 'SYSTEM STATUS',
                value: 'OPERATIONAL',
                sub: 'All services running',
                icon: ShieldCheck,
                color: '#3fb950',
                delay: '0.15s'
              }
            ].map((stat, i) => (
              <div key={i} className="glass card-hover rounded-2xl p-6 opacity-0 animate-fade-up"
                   style={{ animationDelay: stat.delay, animationFillMode: 'forwards' }}>
                <div className="flex items-start justify-between mb-4">
                  <p className="text-xs font-bold tracking-widest" style={{ color: '#484f58' }}>{stat.label}</p>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                       style={{ background: `${stat.color}18`, border: `1px solid ${stat.color}33` }}>
                    <stat.icon size={18} style={{ color: stat.color }} />
                  </div>
                </div>
                <p className="text-2xl font-black stat-number" style={{ color: i === 2 ? '#3fb950' : '#f0f6fc' }}>
                  {stat.value}
                </p>
                <p className="text-xs mt-1" style={{ color: '#484f58' }}>{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* Client Table */}
          <div className="glass rounded-2xl overflow-hidden opacity-0 animate-fade-up stagger-4" style={{ animationFillMode: 'forwards' }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2">
                <Users size={18} style={{ color: '#4f9cf9' }} />
                <h3 className="font-bold text-sm" style={{ color: '#f0f6fc' }}>Client Registry</h3>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{ background: 'rgba(79,156,249,0.1)', color: '#4f9cf9', border: '1px solid rgba(79,156,249,0.2)' }}>
                  {clients.length}
                </span>
              </div>
            </div>
            <table className="w-full table-dark">
              <thead>
                <tr>
                  {['Account No.', 'Name', 'Balance', 'Status', 'Action'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-bold tracking-widest"
                        style={{ color: '#484f58' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(5)].map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="skeleton h-4 rounded" style={{ width: j === 1 ? 120 : j === 0 ? 160 : 80 }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : clients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-sm" style={{ color: '#484f58' }}>
                      No clients registered yet.
                    </td>
                  </tr>
                ) : clients.map((c, idx) => (
                  <tr key={c.id} className="opacity-0 animate-fade-up"
                      style={{ animationDelay: `${idx * 0.04}s`, animationFillMode: 'forwards' }}>
                    <td className="px-6 py-4 font-mono text-xs" style={{ color: '#4f9cf9' }}>{c.account_number}</td>
                    <td className="px-6 py-4 font-bold text-sm" style={{ color: '#f0f6fc' }}>{c.name}</td>
                    <td className="px-6 py-4 font-bold text-sm" style={{ color: '#f0f6fc' }}>
                      ฿{Number(c.balance).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${c.status === 'Active' ? 'status-badge-active' : 'status-badge-blocked'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <a href={`/dashboard/manage/${c.id}`}
                         className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all btn-shimmer"
                         style={{ background: 'rgba(79,156,249,0.1)', border: '1px solid rgba(79,156,249,0.2)', color: '#4f9cf9' }}>
                        Manage <ChevronRight size={14} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Client Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
             onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="glass rounded-2xl p-8 w-full max-w-md receipt-modal"
               style={{ boxShadow: '0 8px 64px rgba(0,0,0,0.8), 0 0 0 1px rgba(79,156,249,0.15)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-black text-lg" style={{ color: '#f0f6fc' }}>Add New Client</h2>
              <button onClick={() => setShowForm(false)}
                      className="p-2 rounded-lg transition-all"
                      style={{ background: 'rgba(255,255,255,0.06)', color: '#8b949e' }}>
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold tracking-widest mb-2" style={{ color: '#484f58' }}>FULL NAME *</label>
                <input placeholder="John Doe" className="input-dark"
                       value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest mb-2" style={{ color: '#484f58' }}>EMAIL</label>
                <input placeholder="john@example.com" className="input-dark"
                       value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest mb-2" style={{ color: '#484f58' }}>INITIAL BALANCE (THB) *</label>
                <input type="number" placeholder="0.00" className="input-dark"
                       value={formData.balance} onChange={e => setFormData({ ...formData, balance: e.target.value })} />
              </div>
              <button onClick={handleCreate}
                      className="w-full py-3 rounded-xl font-black text-sm mt-2 btn-shimmer"
                      style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white', boxShadow: '0 4px 20px rgba(59,130,246,0.4)' }}>
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}