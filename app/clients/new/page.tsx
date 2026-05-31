// app/clients/new/page.tsx
"use client";
import { useState } from "react";
import * as storage from "@/app/lib/storage";
import Card from "@/app/components/Card";
import Button from "@/app/components/Button";
import { ArrowLeft, UserPlus, ShieldCheck, Mail, User, Globe } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AddClientPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [balance, setBalance] = useState(0);
  const [region, setRegion] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!name || !email || balance < 0 || !region) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง");
      setLoading(false);
      return;
    }

    storage.insertClient({
      name,
      email,
      account_number: storage.generateAccountNumber(),
      balance,
      status: "Active",
      region,
    });

    // Simulated short delay for high-quality enterprise feel
    setTimeout(() => {
      setLoading(false);
      router.push("/clients");
    }, 600);
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft size={16} />
        ย้อนกลับไปยังทะเบียนบัญชี
      </button>

      <Card elevated className="relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-[#0A2540] to-blue-600" />
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
            <UserPlus size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">เปิดบัญชีลูกค้าใหม่ (Add New Bank Client)</h2>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">กรอกข้อมูลผู้จดทะเบียนบัญชีด้านล่างให้ครบถ้วนเพื่อส่งประวัติ</p>
          </div>
        </div>

        <hr className="border-slate-200 my-5" />

        {/* Register Account Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Customer Full Name */}
          <div>
            <label className="bank-label">ชื่อ-นามสกุลลูกค้า (Full Name) *</label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User size={16} />
              </div>
              <input
                type="text"
                placeholder="เช่น นายธนาคาร ดีประเสริฐ"
                className="bank-input pl-10"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="bank-label">อีเมลติดต่อ (Email Address) *</label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail size={16} />
              </div>
              <input
                type="email"
                placeholder="client@wavybank.com"
                className="bank-input pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Initial Balance */}
          <div>
            <label className="bank-label">ยอดเงินฝากเริ่มต้น (Initial Deposit) *</label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <span className="text-sm font-semibold">฿</span>
              </div>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="bank-input pl-8"
                value={balance || ""}
                onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          {/* Region Location */}
          <div>
            <label className="bank-label">ภูมิภาค / สาขา (Region/Branch) *</label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Globe size={16} />
              </div>
              <input
                type="text"
                placeholder="เช่น กรุงเทพมหานคร, ภาคเหนือ"
                className="bank-input pl-10"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                required
              />
            </div>
          </div>

          <hr className="border-slate-200 my-6" />

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              className="w-1/3"
              onClick={() => router.back()}
              disabled={loading}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="w-2/3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  กำลังลงทะเบียน...
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  ยืนยันการสร้างบัญชี
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
