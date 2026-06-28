"use client";
import { useEffect, useState } from "react";
import * as storage from "@/app/lib/storage";
import { useRouter } from "next/navigation";
import { LogOut, Wallet, Send, RefreshCw, Copy, CheckCircle, Loader2, ArrowUpRight, ArrowDownLeft, Clock, Shield } from "lucide-react";

// ─── PIN Modal ───────────────────────────────────────────────
function PinModal({ onConfirm, onCancel, amount, receiverName }: any) {
  const [pin, setPin] = useState("");
  const CORRECT_PIN = "123456"; // Default PIN for demo — can be stored per user

  const handleKey = (k: string) => {
    if (k === "DEL") { setPin(p => p.slice(0, -1)); return; }
    if (pin.length >= 6) return;
    const next = pin + k;
    setPin(next);
    if (next.length === 6) {
      setTimeout(() => {
        if (next === CORRECT_PIN) {
          onConfirm();
        } else {
          alert("PIN ไม่ถูกต้อง! ลองใหม่อีกครั้ง\n(PIN สาธิต: 1 2 3 4 5 6)");
          setPin("");
        }
      }, 200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }}>
      <div className="glass rounded-3xl p-8 w-full max-w-sm receipt-modal text-center"
           style={{ boxShadow: '0 8px 64px rgba(0,0,0,0.8), 0 0 0 1px rgba(79,156,249,0.2)' }}>
        <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
             style={{ background: 'rgba(79,156,249,0.12)', border: '1px solid rgba(79,156,249,0.25)' }}>
          <Shield size={28} style={{ color: '#4f9cf9' }} />
        </div>
        <h2 className="font-black text-lg mb-1" style={{ color: '#f0f6fc' }}>ยืนยัน PIN</h2>
        <p className="text-xs mb-1" style={{ color: '#8b949e' }}>โอนเงิน <strong style={{ color: '#3fb950' }}>฿{Number(amount).toLocaleString()}</strong></p>
        <p className="text-xs mb-6" style={{ color: '#484f58' }}>ไปยัง {receiverName || '...'}</p>
        <p className="text-xs mb-2 italic" style={{ color: '#484f58' }}>PIN สาธิต: 123456</p>

        {/* PIN Dots */}
        <div className="flex justify-center gap-3 mb-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`pin-dot ${i < pin.length ? 'filled' : ''}`} />
          ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {['1','2','3','4','5','6','7','8','9','','0','DEL'].map((k, i) => (
            k === '' ? <div key={i} /> :
            <button key={i} onClick={() => handleKey(k)}
                    className="h-14 rounded-xl font-bold text-lg transition-all"
                    style={{
                      background: k === 'DEL' ? 'rgba(248,81,73,0.08)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${k === 'DEL' ? 'rgba(248,81,73,0.2)' : 'rgba(255,255,255,0.08)'}`,
                      color: k === 'DEL' ? '#f85149' : '#f0f6fc'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = k === 'DEL' ? 'rgba(248,81,73,0.16)' : 'rgba(255,255,255,0.1)')}
                    onMouseLeave={e => (e.currentTarget.style.background = k === 'DEL' ? 'rgba(248,81,73,0.08)' : 'rgba(255,255,255,0.04)')}>
              {k}
            </button>
          ))}
        </div>

        <button onClick={onCancel} className="w-full py-2 text-sm font-bold" style={{ color: '#484f58' }}>
          ยกเลิก
        </button>
      </div>
    </div>
  );
}

// ─── Receipt Modal ────────────────────────────────────────────
function ReceiptModal({ transfer, onClose }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }}>
      <div className="glass rounded-3xl p-8 w-full max-w-sm receipt-modal text-center"
           style={{ boxShadow: '0 8px 64px rgba(0,0,0,0.8), 0 0 0 1px rgba(63,185,80,0.3)' }}>
        <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
             style={{ background: 'rgba(63,185,80,0.15)', border: '2px solid rgba(63,185,80,0.4)' }}>
          <CheckCircle size={36} style={{ color: '#3fb950' }} />
        </div>
        <h2 className="font-black text-xl mb-1 text-glow-green" style={{ color: '#3fb950' }}>โอนเงินสำเร็จ!</h2>
        <p className="text-sm mb-6" style={{ color: '#8b949e' }}>ธุรกรรมได้รับการบันทึกแล้ว</p>

        <div className="rounded-2xl p-5 mb-6 text-left space-y-3"
             style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            ['จำนวนเงิน', `฿${Number(transfer.amount).toLocaleString()}`],
            ['โอนไปยัง', transfer.receiverName],
            ['เลขบัญชี', transfer.transferTo],
            ['วันเวลา', new Date().toLocaleString('th-TH')],
            ['สถานะ', 'สำเร็จ ✓'],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between items-center text-sm">
              <span style={{ color: '#484f58' }}>{label}</span>
              <span className="font-bold" style={{ color: label === 'จำนวนเงิน' ? '#f85149' : label === 'สถานะ' ? '#3fb950' : '#f0f6fc' }}>
                {val}
              </span>
            </div>
          ))}
        </div>

        <button onClick={onClose}
                className="w-full py-3 rounded-xl font-black text-sm btn-shimmer"
                style={{ background: 'linear-gradient(135deg, #3fb950, #22863a)', color: 'white', boxShadow: '0 4px 20px rgba(63,185,80,0.3)' }}>
          ปิดใบเสร็จ
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function UserDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [transferLoading, setTransferLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transferTo, setTransferTo] = useState("");
  const [amount, setAmount] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const init = async () => {
      const email = storage.getLoggedInUserEmail();
      if (!email) { window.location.href = "/"; return; }
      let existing = storage.findClient(c => c.email === email);
      if (existing) {
        setProfile(existing);
      } else {
        const newAcc = {
          name: "ลูกค้า Google",
          email: email,
          phone: "080-000-0000",
          address: "ระบบธุรกรรมออนไลน์ WAVY BANK",
          branch_code: "000",
          account_number: storage.generateAccountNumber(),
          balance: 500.00,
          status: 'Active',
          region: 'Online'
        };
        const created = storage.insertClient(newAcc);
        setProfile(created);
      }
      setLoading(false);
    };
    init();
  }, []);

  // Fetch transaction history
  useEffect(() => {
    if (!profile) return;
    const fetchTx = async () => {
      const allTx = storage.getTransactions();
      const filtered = allTx.filter(t => t.sender_id === profile.id || t.receiver_id === profile.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 20);
      setTransactions(filtered);
    };
    fetchTx();
  }, [profile]);

  const handleTransferRequest = () => {
    if (!amount || !transferTo) return alert("กรอกข้อมูลให้ครบ");
    if (parseFloat(amount) > profile.balance) return alert("เงินไม่พอครับ");
    if (transferTo === profile.account_number) return alert("โอนให้ตัวเองไม่ได้");
    setShowPin(true);
  };

  const handleTransferConfirm = async () => {
    setShowPin(false);
    setTransferLoading(true);
    try {
      const receiver = storage.findClient(c => c.account_number === transferTo);
      if (!receiver) throw new Error("ไม่พบเลขบัญชีปลายทาง");
      const amtNum = parseFloat(amount);
      // Update balances
      storage.updateClient(profile.id, { balance: profile.balance - amtNum });
      storage.updateClient(receiver.id, { balance: receiver.balance + amtNum });
      // Record transaction
      storage.addTransaction({
        sender_id: profile.id,
        receiver_id: receiver.id,
        sender_account: profile.account_number,
        receiver_account: transferTo,
        amount: amtNum,
        type: 'Transfer',
        description: `โอนเงินจาก ${profile.name} ไปยัง ${receiver.name}`,
        status: 'Success'
      });

      // Refresh profile
      const updatedMe = storage.findClient(profile.id);
      if (updatedMe) setProfile(updatedMe);

      // Refresh transactions
      const allTx = storage.getTransactions();
      const filteredTx = allTx.filter(t => t.sender_id === profile.id || t.receiver_id === profile.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 20);
      setTransactions(filteredTx);

      setReceipt({ amount, transferTo, receiverName: receiver.name });
      setAmount("");
      setTransferTo("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setTransferLoading(false);
    }
  };

  const copyAccNum = () => {
    navigator.clipboard.writeText(profile?.account_number || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    localStorage.clear();
    window.location.href = "/";
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center" style={{ background: '#080c14' }}>
      <div className="relative z-10 text-center">
        <Loader2 size={40} className="mx-auto mb-4" style={{ color: '#4f9cf9' }} />
        <p className="text-sm" style={{ color: '#8b949e' }}>กำลังโหลดข้อมูลบัญชี...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-10" style={{ background: '#080c14' }}>
      <div className="grid-bg" />
      {showPin && (
        <PinModal
          onConfirm={handleTransferConfirm}
          onCancel={() => setShowPin(false)}
          amount={amount}
          receiverName={null}
        />
      )}
      {receipt && <ReceiptModal transfer={receipt} onClose={() => setReceipt(null)} />}

      {/* Header / Balance Card */}
      <div className="relative z-10 p-5 pb-20" style={{ background: 'linear-gradient(180deg, rgba(59,130,246,0.15) 0%, transparent 100%)' }}>
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2 font-black text-lg" style={{ color: '#f0f6fc' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                   style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
                <Wallet size={16} className="text-white" />
              </div>
              WAVY APP
            </div>
            <button onClick={handleLogout}
                    className="p-2.5 rounded-xl transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#8b949e' }}>
              <LogOut size={18} />
            </button>
          </div>

          {/* Balance Card */}
          <div className="glass-blue rounded-3xl p-6" style={{ animationFillMode: 'forwards' }}>
            <p className="text-xs font-bold tracking-widest mb-2" style={{ color: '#8b949e' }}>ยอดเงินคงเหลือ</p>
            <h1 className="text-5xl font-black mb-1 text-glow-blue" style={{ color: '#4f9cf9' }}>
              ฿{profile?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h1>
            <div className="h-px my-4" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs mb-1" style={{ color: '#484f58' }}>ชื่อบัญชี</p>
                <p className="font-bold" style={{ color: '#f0f6fc' }}>{profile?.name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs mb-1" style={{ color: '#484f58' }}>เลขบัญชี</p>
                <button onClick={copyAccNum} className="flex items-center gap-1.5 font-mono font-bold text-sm transition-all"
                        style={{ color: copied ? '#3fb950' : '#4f9cf9' }}>
                  {profile?.account_number}
                  {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transfer Section */}
      <div className="relative z-10 max-w-md mx-auto px-5 -mt-12">
        <div className="glass rounded-2xl p-6 mb-6" style={{ animationFillMode: 'forwards' }}>
          <h3 className="font-black text-sm mb-4 flex items-center gap-2" style={{ color: '#f0f6fc' }}>
            <Send size={18} style={{ color: '#4f9cf9' }} />
            โอนเงิน
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold tracking-widest mb-2" style={{ color: '#484f58' }}>เลขบัญชีปลายทาง</label>
              <input
                placeholder="XXX-XXXXX-XX"
                className="input-dark font-mono"
                value={transferTo}
                onChange={e => setTransferTo(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-widest mb-2" style={{ color: '#484f58' }}>จำนวนเงิน (THB)</label>
              <input
                type="number"
                placeholder="0.00"
                className="input-dark"
                style={{ fontSize: '1.5rem', fontWeight: 900 }}
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
            </div>
            <button
              onClick={handleTransferRequest}
              disabled={transferLoading || !amount || !transferTo}
              className="w-full py-4 rounded-xl font-black text-sm btn-shimmer mt-2 transition-all flex items-center justify-center gap-2"
              style={{
                background: transferLoading || !amount || !transferTo
                  ? 'rgba(255,255,255,0.06)'
                  : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: transferLoading || !amount || !transferTo ? '#484f58' : 'white',
                boxShadow: transferLoading || !amount || !transferTo ? 'none' : '0 4px 24px rgba(59,130,246,0.4)',
                cursor: transferLoading || !amount || !transferTo ? 'not-allowed' : 'pointer'
              }}>
              {transferLoading ? <><Loader2 size={18} className="" /> กำลังทำรายการ...</> : <><Send size={18} /> ยืนยันโอนเงิน</>}
            </button>
          </div>
        </div>

        {/* Transaction History */}
        <div className="glass rounded-2xl overflow-hidden" style={{ animationFillMode: 'forwards' }}>
          <div className="flex items-center gap-2 px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <Clock size={16} style={{ color: '#4f9cf9' }} />
            <h3 className="font-black text-sm" style={{ color: '#f0f6fc' }}>ประวัติธุรกรรม</h3>
          </div>
          {transactions.length === 0 ? (
            <div className="py-12 text-center text-sm" style={{ color: '#484f58' }}>
              ยังไม่มีประวัติการทำรายการ
            </div>
          ) : transactions.map((tx, i) => {
            const isSender = tx.sender_id === profile?.id;
            return (
              <div key={tx.id} className="flex items-center justify-between px-6 py-4"
                   style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                       style={{
                         background: isSender ? 'rgba(248,81,73,0.1)' : 'rgba(63,185,80,0.1)',
                         border: `1px solid ${isSender ? 'rgba(248,81,73,0.2)' : 'rgba(63,185,80,0.2)'}`
                       }}>
                    {isSender
                      ? <ArrowUpRight size={16} style={{ color: '#f85149' }} />
                      : <ArrowDownLeft size={16} style={{ color: '#3fb950' }} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: '#f0f6fc' }}>{isSender ? 'โอนออก' : 'รับเงิน'}</p>
                    <p className="text-xs" style={{ color: '#484f58' }}>
                      {isSender ? tx.receiver_account : tx.sender_account} · {new Date(tx.created_at).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                </div>
                <p className="font-black text-sm" style={{ color: isSender ? '#f85149' : '#3fb950' }}>
                  {isSender ? '-' : '+'}฿{Number(tx.amount).toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}