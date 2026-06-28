// app/clients/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import * as storage from "@/app/lib/storage";
import Card from "@/app/components/Card";
import Button from "@/app/components/Button";
import {
  ArrowLeft,
  Save,
  Ban,
  Trash2,
  History,
  ShieldCheck,
  AlertOctagon,
  Edit3,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  User,
  Mail,
  Hash,
  Globe,
  Plus,
  Minus,
  ArrowRightLeft,
  Landmark,
  Phone,
  MapPin,
  Building
} from "lucide-react";

export default function ManageClientPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = Number(params.id);

  const [client, setClient] = useState<storage.Client | null>(null);
  const [allClients, setAllClients] = useState<storage.Client[]>([]);
  const [transactions, setTransactions] = useState<storage.Transaction[]>([]);
  
  // Form states
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editBranchCode, setEditBranchCode] = useState("");
  const [editRegion, setEditRegion] = useState("");
  const [editBalance, setEditBalance] = useState("");

  // Bank Actions Form states
  const [actionTab, setActionTab] = useState<"deposit" | "withdraw" | "transfer">("deposit");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [receiverId, setReceiverId] = useState("");

  // Status/Interactive states
  const [savingInfo, setSavingInfo] = useState(false);
  const [saveInfoOk, setSaveInfoOk] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    fetchClientData();
  }, [clientId]);

  const fetchClientData = () => {
    const c = storage.getClients().find((x) => x.id === clientId);
    if (c) {
      setClient(c);
      setEditName(c.name);
      setEditEmail(c.email);
      setEditPhone(c.phone || "");
      setEditAddress(c.address || "");
      setEditBranchCode(c.branch_code || "");
      setEditRegion(c.region);
      setEditBalance(c.balance.toString());
    } else {
      router.push("/clients");
    }

    // Get client transactions
    const allTx = storage.getTransactions();
    const clientTx = allTx.filter((t) => t.sender_id === clientId || t.receiver_id === clientId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setTransactions(clientTx);

    // Get all clients list for Transfer dropdown
    const activeClientsList = storage.getClients().filter((x) => x.id !== clientId && x.status === "Active");
    setAllClients(activeClientsList);
  };

  // 1. Edit Profile Info
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingInfo(true);
    setSaveInfoOk(false);

    storage.updateClient(clientId, {
      name: editName,
      email: editEmail,
      phone: editPhone,
      address: editAddress,
      branch_code: editBranchCode,
      region: editRegion,
      balance: parseFloat(editBalance) || 0
    });

    setTimeout(() => {
      setSavingInfo(false);
      setSaveInfoOk(true);
      fetchClientData();
      setTimeout(() => setSaveInfoOk(false), 2000);
    }, 500);
  };

  // 2. Deposit Funds
  const handleDeposit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("กรุณากรอกจำนวนเงินฝากที่ถูกต้อง");
      return;
    }
    if (!client) return;

    const depositAmt = parseFloat(amount);
    const isOwner = client.account_number === "1017777777";
    const fee = isOwner ? 0 : 1;

    if (depositAmt < fee) {
      alert(`จำนวนเงินฝากต้องไม่ต่ำกว่า ${fee} บาท (เนื่องจากมีค่าธรรมเนียมระบบ ${fee} บาท)`);
      return;
    }

    setActionLoading(true);

    // Update balance: add deposit and deduct fee
    const newBalance = client.balance + depositAmt - fee;
    storage.updateClient(clientId, { balance: newBalance });

    // Route fee to owner
    if (fee > 0) {
      const owner = storage.getOwnerAccount();
      if (owner) {
        storage.updateClient(owner.id, { balance: owner.balance + fee });
      }
    }

    // Add transaction log
    storage.addTransaction({
      sender_id: undefined,
      sender_account: "เงินสดเคาน์เตอร์ธนาคาร (CASH)",
      receiver_id: clientId,
      receiver_account: client.account_number,
      amount: depositAmt - fee,
      type: "Deposit",
      description: (description || "รายการฝากเงินสดผ่านเคาน์เตอร์บริการโดยผู้ดูแลระบบ") + (fee > 0 ? " (หักค่าธรรมเนียมระบบ 1 บาท)" : "")
    });

    setTimeout(() => {
      setActionLoading(false);
      setAmount("");
      setDescription("");
      setActionMessage("ทำรายการฝากเงินเสร็จสิ้น ยอดเงินคงเหลืออัปเดตแล้ว!");
      fetchClientData();
      setTimeout(() => setActionMessage(""), 3000);
    }, 500);
  };

  // 3. Withdraw Funds
  const handleWithdraw = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("กรุณากรอกจำนวนเงินถอนที่ถูกต้อง");
      return;
    }
    if (!client) return;

    const withdrawAmt = parseFloat(amount);
    const isOwner = client.account_number === "1017777777";
    const fee = isOwner ? 0 : 1;
    const totalDeduction = withdrawAmt + fee;

    if (client.balance < totalDeduction) {
      alert(`ยอดคงเหลือในบัญชีไม่เพียงพอสำหรับการทำรายการ (ต้องการยอดครอบคลุมค่าธรรมเนียมระบบ ${fee} บาท)`);
      return;
    }

    setActionLoading(true);
    const newBalance = client.balance - totalDeduction;
    storage.updateClient(clientId, { balance: newBalance });

    // Route fee to owner
    if (fee > 0) {
      const owner = storage.getOwnerAccount();
      if (owner) {
        storage.updateClient(owner.id, { balance: owner.balance + fee });
      }
    }

    // Add transaction log
    storage.addTransaction({
      sender_id: clientId,
      sender_account: client.account_number,
      receiver_id: undefined,
      receiver_account: "เบิกถอนเงินสด (CASH_OUT)",
      amount: withdrawAmt,
      type: "Withdraw",
      description: (description || "รายการถอนเงินสดผ่านเคาน์เตอร์บริการโดยผู้ดูแลระบบ") + (fee > 0 ? " (หักค่าธรรมเนียมระบบ 1 บาท)" : "")
    });

    setTimeout(() => {
      setActionLoading(false);
      setAmount("");
      setDescription("");
      setActionMessage("ทำรายการถอนเงินเสร็จสิ้น ยอดเงินคงเหลืออัปเดตแล้ว!");
      fetchClientData();
      setTimeout(() => setActionMessage(""), 3000);
    }, 500);
  };

  // 4. Transfer Funds to peer
  const handleTransfer = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("กรุณากรอกจำนวนเงินโอนที่ถูกต้อง");
      return;
    }
    if (!receiverId) {
      alert("กรุณาเลือกบัญชีปลายทางผู้รับโอน");
      return;
    }
    if (!client) return;

    const transferAmt = parseFloat(amount);
    const isOwner = client.account_number === "1017777777";
    const fee = isOwner ? 0 : 1;
    const totalDeduction = transferAmt + fee;

    if (client.balance < totalDeduction) {
      alert(`ยอดเงินคงเหลือในบัญชีไม่เพียงพอสำหรับการโอน (ต้องการยอดครอบคลุมค่าธรรมเนียมระบบ ${fee} บาท)`);
      return;
    }

    const receiver = allClients.find((x) => x.id === Number(receiverId));
    if (!receiver) {
      alert("ไม่พบข้อมูลบัญชีปลายทางในระบบ");
      return;
    }

    setActionLoading(true);

    // Subtract from sender (including fee)
    storage.updateClient(clientId, { balance: client.balance - totalDeduction });

    // Add to receiver
    storage.updateClient(receiver.id, { balance: receiver.balance + transferAmt });

    // Route fee to owner
    if (fee > 0) {
      const owner = storage.getOwnerAccount();
      if (owner) {
        storage.updateClient(owner.id, { balance: owner.balance + fee });
      }
    }

    // Add transaction log
    storage.addTransaction({
      sender_id: clientId,
      sender_account: client.account_number,
      receiver_id: receiver.id,
      receiver_account: receiver.account_number,
      amount: transferAmt,
      type: "Transfer",
      description: (description || `โอนเงินจากบัญชี ${client.name} ไปยังบัญชี ${receiver.name}`) + (fee > 0 ? " (หักค่าธรรมเนียมระบบ 1 บาท)" : "")
    });

    setTimeout(() => {
      setActionLoading(false);
      setAmount("");
      setReceiverId("");
      setDescription("");
      setActionMessage("ดำเนินการโอนเงินสำเร็จเรียบร้อยแล้ว!");
      fetchClientData();
      setTimeout(() => setActionMessage(""), 3000);
    }, 600);
  };

  // 5. Freeze / Unfreeze
  const toggleStatus = () => {
    if (!client) return;
    const newStatus = client.status === "Active" ? "Blocked" : "Active";
    
    if (!confirm(`ยืนยันการเปลี่ยนสถานะบัญชีเป็น: ${newStatus === "Active" ? "ใช้งานปกติ" : "ระงับการใช้งาน"}?`)) return;

    storage.updateClient(clientId, { status: newStatus });
    fetchClientData();
  };

  // 6. Delete Permanent
  const handleDeleteAccount = () => {
    if (!client) return;
    const txt = prompt("โปรดพิมพ์คำว่า 'DELETE' เพื่อยืนยันการลบบัญชีและประวัติการเงินอย่างถาวร (ไม่สามารถกู้คืนได้)");
    if (txt !== "DELETE") return;

    storage.deleteClient(clientId);
    router.push("/clients");
  };

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-400">กำลังดึงข้อมูลบัญชีลูกค้า...</p>
      </div>
    );
  }

  // Calculate sent/received stats for this client
  const totalSent = transactions
    .filter((t) => t.sender_id === clientId)
    .reduce((s, t) => s + Number(t.amount), 0);
  
  const totalReceived = transactions
    .filter((t) => t.receiver_id === clientId)
    .reduce((s, t) => s + Number(t.amount), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-850 pb-5 gap-4">
        <div>
          <button
            onClick={() => router.push("/clients")}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors mb-2"
          >
            <ArrowLeft size={14} />
            ย้อนกลับไปยังทะเบียนบัญชี
          </button>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <User className="text-blue-500" size={24} />
            จัดการรายละเอียดบัญชีรายบุคคล (Account Manager)
          </h1>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold font-mono bg-slate-950 text-slate-400 border border-slate-800 px-2.5 py-1 rounded-md">
            ID: {client.id} · ACC NO: {client.account_number}
          </span>
        </div>
      </div>

      {/* Top 3 KPI stats cards relating strictly to this user */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="relative overflow-hidden hover:shadow-md" elevated>
          <div className="absolute top-0 inset-x-0 h-[2px] bg-blue-600" />
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ยอดเงินคงเหลือในบัญชี</p>
            <div className="w-7 h-7 bg-blue-950/40 rounded-lg flex items-center justify-center text-blue-450 border border-blue-900/40">
              <DollarSign size={14} />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-105 mt-2">
            ฿{client.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[9px] text-slate-500 font-semibold block mt-1">อัปเดตแบบเรียลไทม์ตามธุรกรรม</span>
        </Card>

        <Card className="relative overflow-hidden hover:shadow-md">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-rose-600" />
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ยอดการโอนออก/เบิกถอน</p>
            <div className="w-7 h-7 bg-rose-950/40 rounded-lg flex items-center justify-center text-rose-400 border border-rose-900/40">
              <TrendingDown size={14} />
            </div>
          </div>
          <p className="text-3xl font-black text-rose-450 mt-2">
            ฿{totalSent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[9px] text-slate-500 font-semibold block mt-1">ประวัติการหักบัญชีสะสม</span>
        </Card>

        <Card className="relative overflow-hidden hover:shadow-md">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-emerald-600" />
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ยอดการฝากเข้า/รับโอน</p>
            <div className="w-7 h-7 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400 border border-emerald-900/40">
              <TrendingUp size={14} />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-400 mt-2">
            ฿{totalReceived.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[9px] text-slate-500 font-semibold block mt-1">ประวัติเงินรับสะสม</span>
        </Card>
      </div>

      {/* Main Double Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Edit Info Form and Transaction Operations */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Edit Client Information Card */}
          <Card>
            <div className="flex items-center gap-2 mb-6">
              <Edit3 size={18} className="text-blue-500" />
              <h2 className="text-sm font-bold text-slate-200">แก้ไขข้อมูลบัญชีผู้จดทะเบียน</h2>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="bank-label">ชื่อบัญชีลูกค้า *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                      <User size={14} />
                    </div>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="bank-input pl-9"
                    />
                  </div>
                </div>

                <div>
                  <label className="bank-label">อีเมลติดต่อบัญชี *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                      <Mail size={14} />
                    </div>
                    <input
                      type="email"
                      required
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="bank-input pl-9"
                    />
                  </div>
                </div>

                <div>
                  <label className="bank-label">เบอร์โทรศัพท์มือถือ *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                      <Phone size={14} />
                    </div>
                    <input
                      type="text"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="bank-input pl-9"
                    />
                  </div>
                </div>

                <div>
                  <label className="bank-label">เลขที่บัญชี (ระบบตั้งค่า) *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                      <Hash size={14} />
                    </div>
                    <input
                      type="text"
                      disabled
                      value={client.account_number}
                      className="bank-input pl-9 bg-slate-950 cursor-not-allowed text-slate-500 border-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="bank-label">รหัสสาขา (Branch Code) *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                      <Building size={14} />
                    </div>
                    <input
                      type="text"
                      required
                      value={editBranchCode}
                      onChange={(e) => setEditBranchCode(e.target.value)}
                      className="bank-input pl-9"
                    />
                  </div>
                </div>

                <div>
                  <label className="bank-label">สาขาจัดทำ (Branch/Region) *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                      <Globe size={14} />
                    </div>
                    <input
                      type="text"
                      required
                      value={editRegion}
                      onChange={(e) => setEditRegion(e.target.value)}
                      className="bank-input pl-9"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="bank-label">ที่อยู่ตามทะเบียนบ้าน/ติดต่อ (Address) *</label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 flex items-start text-slate-500 pointer-events-none">
                      <MapPin size={14} />
                    </div>
                    <textarea
                      required
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      className="bank-input pl-9 h-16 resize-none py-1.5"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="bank-label">ปรับเปลี่ยนเงินคงเหลือบัญชีโดยตรง (ยอดคงเหลือปัจจุบัน) *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                      <span className="text-xs font-semibold">฿</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editBalance}
                      onChange={(e) => setEditBalance(e.target.value)}
                      className="bank-input pl-8 font-mono text-sm"
                    />
                  </div>
                  <span className="text-[10px] text-rose-400 font-bold block mt-1.5">
                    ⚠️ คำเตือน: การเปลี่ยนตัวเลขยอดคงเหลือโดยตรงจะไม่ถูกบันทึกเป็นรายการธุรกรรมฝาก/ถอนลงในประวัติบัญชี
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  {saveInfoOk && (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 animate-fade-in">
                      <ShieldCheck size={14} />
                      บันทึกข้อมูลเรียบร้อยแล้ว!
                    </span>
                  )}
                </div>
                <Button type="submit" variant="primary" disabled={savingInfo} className="min-w-[120px]">
                  {savingInfo ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </Button>
              </div>
            </form>
          </Card>

          {/* Bank Operations Card: Deposit / Withdraw / Transfer */}
          <Card className="relative">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800 gap-3 mb-6">
              <div className="flex items-center gap-2">
                <Landmark size={18} className="text-blue-500" />
                <h2 className="text-sm font-bold text-slate-200">ธุรกรรมเคาน์เตอร์บริการ (Bank Services Console)</h2>
              </div>
              
              {/* Tab Navigation selectors */}
              <div className="inline-flex rounded-xl bg-slate-950 p-0.5 border border-slate-800">
                <button
                  type="button"
                  onClick={() => { setActionTab("deposit"); setAmount(""); }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    actionTab === "deposit" ? "bg-slate-800 text-blue-400 shadow-md border border-slate-700" : "text-slate-400 hover:text-slate-250"
                  }`}
                >
                  <Plus size={11} className="inline mr-1" />
                  ฝากเงิน (Deposit)
                </button>
                <button
                  type="button"
                  onClick={() => { setActionTab("withdraw"); setAmount(""); }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    actionTab === "withdraw" ? "bg-slate-800 text-blue-400 shadow-md border border-slate-700" : "text-slate-400 hover:text-slate-250"
                  }`}
                >
                  <Minus size={11} className="inline mr-1" />
                  ถอนเงิน (Withdraw)
                </button>
                <button
                  type="button"
                  onClick={() => { setActionTab("transfer"); setAmount(""); }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    actionTab === "transfer" ? "bg-slate-800 text-blue-400 shadow-md border border-slate-700" : "text-slate-400 hover:text-slate-250"
                  }`}
                >
                  <ArrowRightLeft size={11} className="inline mr-1" />
                  โอนเงิน (Transfer)
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {actionTab === "transfer" && (
                <div>
                  <label className="bank-label">เลือกบัญชีผู้รับเงินโอน (Active Clients) *</label>
                  <select
                    value={receiverId}
                    onChange={(e) => setReceiverId(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-slate-950 border border-slate-850 rounded-xl shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-bold text-slate-200"
                  >
                    <option value="" className="bg-slate-900 text-slate-400">-- โปรดเลือกบัญชีผู้รับเงินโอน --</option>
                    {allClients.map((c) => (
                      <option key={c.id} value={c.id} className="bg-slate-900 text-slate-200">
                        {c.name} ({c.account_number}) - ยอดเงิน: ฿{c.balance.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="bank-label">จำนวนเงินดำเนินการ *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                      <span className="text-xs font-semibold">฿</span>
                    </div>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bank-input pl-7 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="bank-label">คำอธิบายเพิ่มเติมสำหรับการทำรายการ (Description)</label>
                  <input
                    type="text"
                    placeholder="ป้อนรายละเอียดธุรกรรม (ไม่บังคับ)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bank-input"
                  />
                </div>
              </div>

              {/* Toast alert confirmation */}
              {actionMessage && (
                <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 text-xs font-bold text-emerald-400 rounded-xl flex items-center gap-2 animate-fade-in shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-550 animate-ping" />
                  {actionMessage}
                </div>
              )}

              <div className="pt-2 flex justify-end">
                {actionTab === "deposit" && (
                  <Button variant="success" onClick={handleDeposit} disabled={actionLoading}>
                    {actionLoading ? "กำลังดำเนินการ..." : "ดำเนินการฝากเงิน"}
                  </Button>
                )}
                {actionTab === "withdraw" && (
                  <Button variant="danger" onClick={handleWithdraw} disabled={actionLoading}>
                    {actionLoading ? "กำลังดำเนินการ..." : "ดำเนินการถอนเงิน"}
                  </Button>
                )}
                {actionTab === "transfer" && (
                  <Button variant="primary" onClick={handleTransfer} disabled={actionLoading}>
                    {actionLoading ? "กำลังดำเนินการ..." : "ดำเนินการโอนเงิน"}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right 1 Column: Account Status controls, Danger Zone and System Info */}
        <div className="space-y-6">
          
          {/* Account Status Card */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={18} className="text-blue-500" />
              <h2 className="text-sm font-bold text-slate-200">สถานะและความปลอดภัยบัญชี</h2>
            </div>

            <div className={`p-4 rounded-xl text-center border mb-4 flex flex-col items-center justify-center ${
              client.status === "Active" 
                ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-400" 
                : "bg-rose-955/20 border-rose-900/40 text-rose-450"
            }`}>
              <div className={`w-2.5 h-2.5 rounded-full animate-pulse mb-1.5 ${
                client.status === "Active" ? "bg-emerald-500" : "bg-rose-500"
              }`} />
              <p className="text-lg font-black">{client.status === "Active" ? "สถานะ: ปกติ (Active)" : "สถานะ: ระงับ (Blocked)"}</p>
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                {client.status === "Active" ? "บัญชีนี้สามารถโอนเงิน ฝากเงิน หรือดำเนินกิจกรรมทั่วไปได้ปกติ" : "บัญชีนี้ถูกอายัด ไม่สามารถเบิกถอนหรือรับโอนเงินได้"}
              </p>
            </div>

            <Button
              variant="secondary"
              onClick={toggleStatus}
              className={`w-full font-bold flex items-center justify-center gap-2 ${
                client.status === "Active"
                  ? "border-rose-900 text-rose-400 hover:bg-rose-955/40"
                  : "border-emerald-900 text-emerald-450 hover:bg-emerald-950/40"
              }`}
            >
              {client.status === "Active" ? (
                <>
                  <Ban size={14} />
                  ระงับบัญชีชั่วคราว (Freeze)
                </>
              ) : (
                <>
                  <ShieldCheck size={14} />
                  เปิดการใช้งานบัญชี (Activate)
                </>
              )}
            </Button>
          </Card>

          {/* Danger Zone Card */}
          <Card className="border-rose-900/40 relative overflow-hidden bg-rose-955/10">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-rose-600" />
            <div className="flex items-center gap-2 mb-3">
              <AlertOctagon size={18} className="text-rose-400" />
              <h2 className="text-sm font-bold text-rose-400">พื้นที่อันตราย (Danger Zone)</h2>
            </div>
            
            <p className="text-xs text-slate-400 mb-4 leading-relaxed font-semibold">
              การสั่งลบบัญชีลูกค้ารายนี้จะเป็นการ **ลบข้อมูลถาวรอย่างสมบูรณ์** รวมถึงเลขที่บัญชีและรายการธุรกรรมการเงินที่เกี่ยวข้องทั้งหมดออกจากระบบ
            </p>

            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              className="w-full flex items-center justify-center gap-1.5"
            >
              <Trash2 size={14} />
              ลบบัญชีถาวรออกจากระบบ
            </Button>
          </Card>

          {/* Quick System Info block */}
          <Card className="bg-slate-950 border-slate-900 text-slate-300 relative overflow-hidden font-mono text-xs">
            <div className="absolute top-0 right-0 p-3 opacity-[0.03] text-slate-400">
              <Landmark size={80} />
            </div>
            <div className="relative z-10 space-y-2.5">
              <p className="font-bold text-sm tracking-wider text-slate-200 flex items-center gap-1.5">
                <Landmark size={14} />
                ระบบเซิร์ฟเวอร์หลัก (DB)
              </p>
              <div className="border-t border-slate-850 my-2 pt-2 space-y-1.5">
                <p className="text-slate-400">การเชื่อมต่อ: <span className="text-emerald-400 font-bold">SECURE (TLS/256)</span></p>
                <p className="text-slate-400">ฐานข้อมูล: <span className="text-emerald-400 font-bold">LocalStorage (Synced)</span></p>
                <p className="text-slate-400">ประวัติธุรกรรมบัญชีนี้: <span className="text-blue-400 font-bold">{transactions.length} รายการ</span></p>
              </div>
            </div>
          </Card>
        </div>

      </div>

      {/* Dynamic Specific Client Transaction History Table */}
      <Card noPadding className="overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History size={18} className="text-blue-500" />
            <h2 className="text-sm font-bold text-slate-200">ประวัติธุรกรรมย้อนหลังรายบัญชี (Transaction Log)</h2>
          </div>
          <span className="text-xs font-bold text-blue-400 bg-blue-955/30 border border-blue-900/40 px-2.5 py-0.5 rounded-full">
            {transactions.length} รายการ
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="flex flex-col items-center justify-center gap-2">
              <History size={36} className="text-slate-650" />
              <p className="text-sm font-semibold text-slate-500">ยังไม่มีประวัติการโอนเงิน ฝาก หรือถอนเงิน สำหรับบัญชีลูกค้ารายนี้</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800">
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">วัน-เวลาทำรายการ</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">ประเภทรายการ</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">คำอธิบายธุรกรรม (Description)</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">บัญชีต้นทาง (From)</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">บัญชีปลายทาง (To)</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">จำนวนเงิน (บาท)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {transactions.map((t) => {
                  const isSender = t.sender_id === clientId;
                  return (
                    <tr key={t.id} className="bank-table-row">
                      <td className="px-6 py-4 text-xs font-medium text-slate-400">
                        {new Date(t.created_at).toLocaleString("th-TH")}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          t.type === "Deposit"
                            ? "bg-emerald-955/40 text-emerald-400 border-emerald-900/40"
                            : t.type === "Withdraw"
                            ? "bg-rose-955/40 text-rose-450 border-rose-900/40"
                            : isSender
                            ? "bg-rose-955/40 text-rose-450 border-rose-900/40"
                            : "bg-emerald-955/40 text-emerald-400 border-emerald-900/40"
                        }`}>
                          {t.type === "Deposit" ? (
                            <><ArrowDownLeft size={10} /> ฝากเงิน</>
                          ) : t.type === "Withdraw" ? (
                            <><ArrowUpRight size={10} /> ถอนเงิน</>
                          ) : isSender ? (
                            <><ArrowUpRight size={10} /> โอนเงินออก</>
                          ) : (
                            <><ArrowDownLeft size={10} /> รับโอนเงิน</>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-300 max-w-[240px] truncate" title={t.description}>
                        {t.description || "—"}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-400">{t.sender_account || "—"}</td>
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-400">{t.receiver_account || "—"}</td>
                      <td className={`px-6 py-4 text-sm font-bold text-right ${
                        t.type === "Deposit" 
                          ? "text-emerald-450" 
                          : t.type === "Withdraw" 
                          ? "text-rose-450" 
                          : isSender 
                          ? "text-rose-450" 
                          : "text-emerald-450"
                      }`}>
                        {t.type === "Withdraw" || isSender ? "-" : "+"}฿{Number(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
