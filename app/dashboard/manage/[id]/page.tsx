"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, Save, Ban, Trash2, History, ShieldCheck,
  AlertOctagon, Edit3, DollarSign, TrendingUp, TrendingDown,
  ArrowUpRight, ArrowDownLeft, Clock, User, Mail, Hash, Globe
} from "lucide-react";
import { Landmark } from "lucide-react";

export default function ManageClient() {
  const router = useRouter();
  const params = useParams();
  const [client, setClient] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [editName, setEditName] = useState("");
  const [editBalance, setEditBalance] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState(false);

  useEffect(() => { fetchClientData(); }, []);

  const fetchClientData = async () => {
    const { data: c } = await supabase.from('clients').select('*').eq('id', params.id).single();
    if (c) { setClient(c); setEditName(c.name); setEditBalance(c.balance); }

    const { data: t } = await supabase.from('transactions')
      .select('*')
      .or(`sender_id.eq.${params.id},receiver_id.eq.${params.id}`)
      .order('created_at', { ascending: false });
    setTransactions(t || []);
  };

  const handleUpdate = async () => {
    setSaving(true);
    const { error } = await supabase.from('clients')
      .update({ name: editName, balance: parseFloat(editBalance) })
      .eq('id', params.id);
    setSaving(false);
    if (!error) { setSaveOk(true); setTimeout(() => setSaveOk(false), 2000); setClient({ ...client, name: editName, balance: editBalance }); }
  };

  const toggleStatus = async () => {
    const newStatus = client.status === 'Active' ? 'Blocked' : 'Active';
    if (!confirm(`ยืนยันการเปลี่ยนสถานะเป็น ${newStatus}?`)) return;
    await supabase.from('clients').update({ status: newStatus }).eq('id', params.id);
    setClient({ ...client, status: newStatus });
  };

  const handleDelete = async () => {
    const txt = prompt("พิมพ์ 'DELETE' เพื่อยืนยันการลบบัญชีถาวร");
    if (txt !== 'DELETE') return;
    await supabase.from('transactions').delete().or(`sender_id.eq.${params.id},receiver_id.eq.${params.id}`);
    await supabase.from('clients').delete().eq('id', params.id);
    router.push("/dashboard");
  };

  const totalSent = transactions.filter(t => t.sender_id?.toString() === params.id?.toString()).reduce((s, t) => s + Number(t.amount), 0);
  const totalReceived = transactions.filter(t => t.receiver_id?.toString() === params.id?.toString()).reduce((s, t) => s + Number(t.amount), 0);

  if (!client) return (
    <div className="h-screen flex items-center justify-center" style={{ background: '#080c14' }}>
      <div className="animated-bg" />
      <p className="relative z-10 text-sm animate-blink" style={{ color: '#484f58' }}>Loading System...</p>
    </div>
  );

  return (
    <div className="min-h-screen p-6" style={{ background: '#080c14' }}>
      <div className="animated-bg grid-bg" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between mb-8 animate-fade-up">
          <button onClick={() => router.back()}
                  className="flex items-center gap-2 text-sm font-bold transition-all"
                  style={{ color: '#8b949e' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#4f9cf9')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#8b949e')}>
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
          <div className="text-right">
            <h1 className="font-black text-lg" style={{ color: '#f0f6fc' }}>Account Management</h1>
            <p className="text-xs font-mono" style={{ color: '#484f58' }}>
              ID: {params.id} · {client.account_number}
            </p>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6 opacity-0 animate-fade-up stagger-1" style={{ animationFillMode: 'forwards' }}>
          {[
            { label: 'CURRENT BALANCE', value: `฿${Number(client.balance).toLocaleString()}`, color: '#4f9cf9', icon: DollarSign },
            { label: 'TOTAL SENT', value: `฿${totalSent.toLocaleString()}`, color: '#f85149', icon: TrendingDown },
            { label: 'TOTAL RECEIVED', value: `฿${totalReceived.toLocaleString()}`, color: '#3fb950', icon: TrendingUp },
          ].map((s) => (
            <div key={s.label} className="glass rounded-2xl p-5 card-hover">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold tracking-widest" style={{ color: '#484f58' }}>{s.label}</p>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Edit Information */}
          <div className="md:col-span-2 glass rounded-2xl p-8 opacity-0 animate-fade-up stagger-2" style={{ animationFillMode: 'forwards' }}>
            <h2 className="font-black text-base mb-6 flex items-center gap-2" style={{ color: '#f0f6fc' }}>
              <Edit3 size={18} style={{ color: '#4f9cf9' }} /> Edit Information
            </h2>

            {/* Client Info Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { icon: User, label: 'Client ID', value: params.id },
                { icon: Mail, label: 'Email', value: client.email || 'N/A' },
                { icon: Hash, label: 'Account Number', value: client.account_number, mono: true },
                { icon: Globe, label: 'Region', value: client.region || 'N/A' },
              ].map((info) => (
                <div key={info.label} className="rounded-xl p-4"
                     style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <info.icon size={12} style={{ color: '#484f58' }} />
                    <p className="text-xs font-bold tracking-widest" style={{ color: '#484f58' }}>{info.label}</p>
                  </div>
                  <p className={`text-sm font-bold truncate ${info.mono ? 'font-mono' : ''}`} style={{ color: '#8b949e' }}>
                    {info.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold tracking-widest mb-3" style={{ color: '#484f58' }}>ACCOUNT NAME</label>
                <input
                  className="input-dark text-lg font-bold"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest mb-3" style={{ color: '#484f58' }}>BALANCE (THB)</label>
                <input
                  type="number"
                  className="input-dark font-mono"
                  style={{ fontSize: '2rem', fontWeight: 900, color: '#4f9cf9' }}
                  value={editBalance}
                  onChange={e => setEditBalance(e.target.value)}
                />
              </div>
              <button onClick={handleUpdate} disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm btn-shimmer transition-all"
                      style={{
                        background: saveOk ? 'linear-gradient(135deg, #3fb950, #22863a)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        color: 'white',
                        boxShadow: `0 4px 20px ${saveOk ? 'rgba(63,185,80,0.3)' : 'rgba(59,130,246,0.3)'}`
                      }}>
                {saving ? 'Saving...' : saveOk ? <><ShieldCheck size={16} /> Saved!</> : <><Save size={16} /> Save Changes</>}
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4 opacity-0 animate-fade-up stagger-3" style={{ animationFillMode: 'forwards' }}>
            {/* Account Status */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-sm font-black mb-4 flex items-center gap-2" style={{ color: '#f0f6fc' }}>
                <ShieldCheck size={16} style={{ color: '#4f9cf9' }} /> Account Status
              </h2>
              <div className="rounded-xl p-4 mb-4 text-center"
                   style={{
                     background: client.status === 'Active' ? 'rgba(63,185,80,0.08)' : 'rgba(248,81,73,0.08)',
                     border: `1px solid ${client.status === 'Active' ? 'rgba(63,185,80,0.2)' : 'rgba(248,81,73,0.2)'}`
                   }}>
                <div className={`w-2.5 h-2.5 rounded-full mx-auto mb-2 ${client.status === 'Active' ? 'bg-green-400 animate-blink' : 'bg-red-400'}`} />
                <p className="font-black text-lg" style={{ color: client.status === 'Active' ? '#3fb950' : '#f85149' }}>
                  {client.status}
                </p>
              </div>
              <button onClick={toggleStatus}
                      className="w-full py-3 rounded-xl font-bold text-sm border flex items-center justify-center gap-2 transition-all"
                      style={{
                        background: client.status === 'Active' ? 'rgba(248,81,73,0.06)' : 'rgba(63,185,80,0.06)',
                        border: `1px solid ${client.status === 'Active' ? 'rgba(248,81,73,0.2)' : 'rgba(63,185,80,0.2)'}`,
                        color: client.status === 'Active' ? '#f85149' : '#3fb950'
                      }}>
                {client.status === 'Active' ? <><Ban size={16} /> Freeze Account</> : <><ShieldCheck size={16} /> Activate Account</>}
              </button>
            </div>

            {/* Danger Zone */}
            <div className="danger-zone p-6">
              <h2 className="text-sm font-black mb-4 flex items-center gap-2" style={{ color: '#f85149' }}>
                <AlertOctagon size={16} /> Danger Zone
              </h2>
              <p className="text-xs mb-4" style={{ color: '#484f58' }}>
                การลบบัญชีจะเป็นการถาวรและไม่สามารถกู้คืนได้
              </p>
              <button onClick={handleDelete}
                      className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all btn-shimmer"
                      style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', color: '#f85149' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,81,73,0.2)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,81,73,0.1)'; }}>
                <Trash2 size={16} /> Delete Permanently
              </button>
            </div>

            {/* System Info */}
            <div className="glass rounded-2xl p-5 font-mono text-xs space-y-2"
                 style={{ background: 'rgba(0,0,0,0.4)' }}>
              <p className="font-black text-sm mb-3 flex items-center gap-2" style={{ color: '#f0f6fc' }}>
                <Landmark size={14} style={{ color: '#4f9cf9' }} /> SYSTEM STATUS
              </p>
              <p style={{ color: '#484f58' }}>Connection: <span style={{ color: '#3fb950' }}>Secure (TLS)</span></p>
              <p style={{ color: '#484f58' }}>Database: <span style={{ color: '#3fb950' }}>Synced</span></p>
              <p style={{ color: '#484f58' }}>Transactions: <span style={{ color: '#4f9cf9' }}>{transactions.length}</span></p>
            </div>
          </div>

          {/* Transaction History */}
          <div className="md:col-span-3 glass rounded-2xl overflow-hidden opacity-0 animate-fade-up stagger-4" style={{ animationFillMode: 'forwards' }}>
            <div className="flex items-center gap-2 px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <History size={18} style={{ color: '#4f9cf9' }} />
              <h2 className="font-black text-sm" style={{ color: '#f0f6fc' }}>Transaction History</h2>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                    style={{ background: 'rgba(79,156,249,0.1)', color: '#4f9cf9', border: '1px solid rgba(79,156,249,0.2)' }}>
                {transactions.length}
              </span>
            </div>
            {transactions.length === 0 ? (
              <div className="py-16 text-center text-sm" style={{ color: '#484f58' }}>
                No transaction history found.
              </div>
            ) : (
              <table className="w-full table-dark">
                <thead>
                  <tr>
                    {['Time', 'Type', 'Description', 'From', 'To', 'Amount'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-bold tracking-widest" style={{ color: '#484f58' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t: any) => {
                    const isSender = t.sender_id?.toString() === params.id?.toString();
                    return (
                      <tr key={t.id}>
                        <td className="px-6 py-4 text-xs font-mono" style={{ color: '#484f58' }}>
                          {new Date(t.created_at).toLocaleString('th-TH')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`flex items-center gap-1.5 text-xs font-bold w-fit px-2 py-1 rounded-full ${isSender ? 'status-badge-blocked' : 'status-badge-active'}`}>
                            {isSender ? <><ArrowUpRight size={12} /> SENT</> : <><ArrowDownLeft size={12} /> RECEIVED</>}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm" style={{ color: '#8b949e' }}>{t.description}</td>
                        <td className="px-6 py-4 text-xs font-mono" style={{ color: '#484f58' }}>{t.sender_account}</td>
                        <td className="px-6 py-4 text-xs font-mono" style={{ color: '#484f58' }}>{t.receiver_account}</td>
                        <td className="px-6 py-4 font-black text-sm" style={{ color: isSender ? '#f85149' : '#3fb950' }}>
                          {isSender ? '-' : '+'}฿{Number(t.amount).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}