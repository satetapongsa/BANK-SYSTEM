// app/settings/page.tsx
"use client";
import { useEffect, useState } from "react";
import Card from "@/app/components/Card";
import Button from "@/app/components/Button";
import * as storage from "@/app/lib/storage";
import { Settings, Shield, RotateCcw, AlertTriangle, Info, Landmark, Check, Coins, UserCheck } from "lucide-react";

export default function SettingsPage() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [clients, setClients] = useState<storage.Client[]>([]);
  const [owner, setOwner] = useState<storage.Client | null>(null);
  const [ownerBalanceInput, setOwnerBalanceInput] = useState("");
  const [selectedClients, setSelectedClients] = useState<number[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    const allClients = storage.getClients();
    setClients(allClients);
    const own = storage.getOwnerAccount();
    if (own) {
      setOwner(own);
      setOwnerBalanceInput(own.balance.toString());
    }
    setIsAdmin(localStorage.getItem("isAdmin") === "true");
  };

  const toggleAdmin = () => {
    const newVal = !isAdmin;
    setIsAdmin(newVal);
    if (newVal) localStorage.setItem("isAdmin", "true");
    else localStorage.removeItem("isAdmin");
  };

  const resetData = () => {
    if (confirm("⚠️ ต้องการลบข้อมูลลูกค้า รายการธุรกรรม และข้อมูลตั้งค่าทั้งหมดและรีเซ็ตระบบกลับสู่ค่าเริ่มต้นใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้!")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // Adjust Owner Balance Directly
  const handleAdjustOwnerBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!owner) return;
    const newBal = parseFloat(ownerBalanceInput);
    if (isNaN(newBal) || newBal < 0) {
      alert("กรุณากรอกยอดเงินคงเหลือที่ถูกต้อง");
      return;
    }

    storage.updateClient(owner.id, { balance: newBal });
    alert(`ปรับแต่งยอดเงินสำเร็จ! ยอดคงเหลือของบัญชีผู้บริหารอัปเดตเป็น ฿${newBal.toLocaleString()} เรียบร้อยแล้ว`);
    fetchData();
  };

  // Sweep funds from selected clients to Owner account
  const handleSweepFunds = () => {
    if (!owner) return;
    if (selectedClients.length === 0) {
      alert("กรุณาเลือกบัญชีผู้ใช้ที่ต้องการดึงเงินอย่างน้อย 1 บัญชี");
      return;
    }

    if (!confirm(`⚠️ ยืนยันการดึงเงินทั้งหมดจาก ${selectedClients.length} บัญชีที่เลือกเข้าสู่บัญชีเจ้าของธนาคารใช่หรือไม่? บัญชีเหล่านั้นจะมียอดเงินกลายเป็น 0`)) {
      return;
    }

    let totalSwept = 0;
    const allClients = storage.getClients();

    selectedClients.forEach((id) => {
      const client = allClients.find(c => c.id === id);
      if (client && client.id !== owner.id) {
        const sweptAmount = client.balance;
        if (sweptAmount > 0) {
          totalSwept += sweptAmount;
          // Set customer balance to 0
          storage.updateClient(client.id, { balance: 0 });
          // Log sweep transaction
          storage.addTransaction({
            sender_id: client.id,
            sender_account: client.account_number,
            receiver_id: owner.id,
            receiver_account: owner.account_number,
            amount: sweptAmount,
            type: "Transfer",
            description: `[Sweep Console] โอนย้ายยอดเงินคงเหลือทั้งหมดเข้าสู่บัญชีผู้บริหารระบบ`
          });
        }
      }
    });

    if (totalSwept > 0) {
      // Add swept amount to owner
      storage.updateClient(owner.id, { balance: owner.balance + totalSwept });
      alert(`ดำเนินการโอนย้ายเงินสำเร็จ! ยอดเงินดึงเข้าระบบคลัง: +฿${totalSwept.toLocaleString()}`);
    } else {
      alert("ไม่มีเงินเหลือในบัญชีที่เลือกเพื่อดึงเข้าคลัง");
    }

    setSelectedClients([]);
    fetchData();
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const ids = clients.filter(c => c.id !== owner?.id).map(c => c.id);
      setSelectedClients(ids);
    } else {
      setSelectedClients([]);
    }
  };

  const handleToggleClient = (id: number) => {
    if (selectedClients.includes(id)) {
      setSelectedClients(selectedClients.filter(x => x !== id));
    } else {
      setSelectedClients([...selectedClients, id]);
    }
  };

  const nonOwnerClients = clients.filter(c => c.id !== owner?.id);
  const isAllSelected = nonOwnerClients.length > 0 && selectedClients.length === nonOwnerClients.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-850 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <Settings className="text-blue-500" size={24} />
            ตั้งค่าระบบควบคุม (System Settings)
          </h1>
          <p className="text-xs font-semibold text-slate-400 mt-1">
            ปรับเปลี่ยนโหมดการเข้าใช้งาน ควบคุมประวัติการเงินส่วนระบบ และจัดการสิทธิ์ผู้ดูแลระบบหลัก
          </p>
        </div>
      </div>

      {/* Admin Mode Toggle */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[2px] bg-blue-600" />
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-955/40 rounded-xl flex items-center justify-center text-blue-450 border border-blue-900/40 flex-shrink-0">
            <Shield size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-slate-200 mb-1">โหมดผู้ดูแลระบบ (Admin Access Control)</h3>
            <p className="text-xs font-semibold text-slate-400 mb-4">
              เปิดใช้งานสิทธิ์บัญชีผู้ใช้ดูแลระบบหลัก หากปิดใช้งานระบบจะไม่ผ่านการควบคุมการใช้งานระดับสูง
            </p>
            
            <label className="inline-flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  id="admin-toggle"
                  checked={isAdmin}
                  onChange={toggleAdmin}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 rounded-full bg-slate-950 border border-slate-800 peer-checked:bg-blue-600 transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform peer-checked:translate-x-5" />
              </div>
              <span className="text-xs font-bold text-slate-400 group-hover:text-slate-250 transition-colors">
                {isAdmin ? "สิทธิ์การเข้าใช้งานแบบแอดมิน: เปิด" : "สิทธิ์การเข้าใช้งานแบบแอดมิน: ปิด"}
              </span>
            </label>
          </div>
        </div>
      </Card>

      {/* Owner Console (Only available when Admin Access is ON) */}
      {isAdmin && (
        <Card className="relative overflow-hidden border-blue-900/40 bg-blue-955/5">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-blue-500 to-indigo-500" />
          <div className="flex items-center gap-2 mb-6">
            <Landmark size={20} className="text-blue-400" />
            <h2 className="text-lg font-black text-slate-100">แผงควบคุมสิทธิ์เจ้าของธนาคาร (Owner Console)</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Col: Owner Profile & Balance Adjustment */}
            <div className="space-y-5">
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">บัญชีผู้ดูแลระบบหลัก</h4>
                {owner ? (
                  <div className="space-y-1.5 text-xs">
                    <p className="text-slate-300 font-bold">ชื่อ: <span className="text-slate-100">{owner.name}</span></p>
                    <p className="text-slate-300 font-bold">เลขบัญชี: <span className="font-mono text-blue-400">{owner.account_number}</span></p>
                    <p className="text-slate-300 font-bold">ยอดเงินคลังปัจจุบัน: <span className="text-emerald-400 font-black">฿{owner.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">ไม่พบบัญชีแอดมินระบบหลัก (กรุณารีเซ็ตระบบ)</p>
                )}
              </div>

              <form onSubmit={handleAdjustOwnerBalance} className="space-y-4">
                <div>
                  <label className="bank-label">ปรับเปลี่ยนยอดเงินบัญชีผู้ดูแลระบบโดยตรง (ตัวเลขใดก็ได้)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                      <span className="text-sm font-semibold">฿</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="bank-input pl-8 font-mono text-slate-150 font-bold"
                      value={ownerBalanceInput}
                      onChange={(e) => setOwnerBalanceInput(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" variant="primary" className="w-full flex items-center gap-1.5 justify-center">
                  <Coins size={15} />
                  ปรับแต่งตัวเลขเงินบัญชีแอดมิน
                </Button>
              </form>
            </div>

            {/* Right Col: Sweep Accounts list */}
            <div className="space-y-4 border-t lg:border-t-0 lg:border-l border-slate-850 pt-5 lg:pt-0 lg:pl-6">
              <div>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex justify-between items-center mb-1">
                  <span>ดึงเงินเข้าสู่ระบบคลัง (Sweep selected funds)</span>
                  <span className="text-[10px] text-blue-450 normal-case bg-blue-955/20 px-2 py-0.5 rounded-md border border-blue-900/30">
                    เลือกอยู่ {selectedClients.length} บัญชี
                  </span>
                </h4>
                <p className="text-[10px] font-semibold text-slate-400 mb-3">
                  เลือกติ๊กบัญชีของผู้ใช้งานที่ต้องการ ดำเนินการโอนย้ายเงินทั้งหมดเข้าสู่บัญชีเจ้าของธนาคารทันที
                </p>
              </div>

              {/* Scrollable list */}
              <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-3 max-h-56 overflow-y-auto space-y-2">
                <label className="flex items-center gap-2.5 py-1 px-1.5 border-b border-slate-850 pb-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-3.5 h-3.5 bg-slate-900 border-slate-800 rounded focus:ring-blue-600 focus:ring-opacity-25"
                  />
                  <span className="text-xs font-bold text-slate-200">เลือกทั้งหมด (Select All Users)</span>
                </label>

                {nonOwnerClients.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">ไม่มีรายชื่อลูกค้าในระบบให้ทำรายการ</p>
                ) : (
                  nonOwnerClients.map((c) => (
                    <label
                      key={c.id}
                      className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-900/80 cursor-pointer select-none transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={selectedClients.includes(c.id)}
                          onChange={() => handleToggleClient(c.id)}
                          className="w-3.5 h-3.5 bg-slate-900 border-slate-800 rounded focus:ring-blue-600 focus:ring-opacity-25"
                        />
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-200 leading-tight">{c.name}</p>
                          <p className="text-[10px] font-mono text-slate-500 leading-none mt-0.5">{c.account_number}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-emerald-450">฿{c.balance.toLocaleString()}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>

              <Button
                type="button"
                variant="danger"
                onClick={handleSweepFunds}
                disabled={selectedClients.length === 0}
                className="w-full flex items-center gap-1.5 justify-center"
              >
                <RotateCcw size={14} className="animate-spin-slow" />
                ดึงเงินทั้งหมดจากบัญชีผู้ใช้ที่เลือก (Sweep Selected)
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Danger Zone */}
      <Card className="border-rose-900/45 bg-rose-955/10 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[2px] bg-rose-600" />
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-rose-950/40 rounded-xl flex items-center justify-center text-rose-450 border border-rose-900/40 flex-shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-rose-400 mb-1">พื้นที่ล้างข้อมูลระบบ (System Danger Zone)</h3>
            <p className="text-xs font-semibold text-slate-400 mb-4 leading-relaxed">
              การสั่งล้างข้อมูลระบบจะทำการ **ลบข้อมูลผู้ลงทะเบียนและประวัติการเงินทั้งหมด** รวมถึงรหัสควบคุมสิทธิ์ออกจากแคชของเบราว์เซอร์ เพื่อความปลอดภัยของข้อมูล
            </p>
            <Button variant="danger" onClick={resetData} className="flex items-center gap-1.5 font-bold">
              <RotateCcw size={14} />
              สั่งล้างและตั้งค่าระบบธนาคารใหม่ทั้งหมด
            </Button>
          </div>
        </div>
      </Card>

      {/* App Info */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center text-slate-400 border border-slate-900 flex-shrink-0">
            <Info size={20} />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-200 mb-1">เกี่ยวกับซอฟต์แวร์ (Software Specification)</h3>
            <div className="space-y-1.5 text-xs text-slate-400 font-semibold font-mono">
              <p>ชื่อระบบ: <span className="text-slate-200">WAVY BANK — Secure Digital Banking Portal</span></p>
              <p>เวอร์ชันผลิตภัณฑ์: <span className="text-slate-200">v1.3.0 (Neon DB & Owner Admin Overhaul)</span></p>
              <p>ระบบการจัดเก็บ: <span className="text-blue-400 font-bold">Client-Side Secure Web Storage & Neon Serverless Postgres (Ready)</span></p>
              <p className="text-[10px] text-slate-500">ระบบนี้ถูกออกแบบมาเพื่อควบคุมการบริหารข้อมูลอย่างสมบูรณ์แบบโดยพนักงานธนาคารเท่านั้น</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
