// app/clients/new/page.tsx
"use client";
import { useState } from "react";
import * as storage from "@/app/lib/storage";
import Card from "@/app/components/Card";
import Button from "@/app/components/Button";
import { ArrowLeft, UserPlus, ShieldCheck, Mail, User, Globe, Phone, MapPin, Building } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AddClientPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [balance, setBalance] = useState(0);
  const [region, setRegion] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!name || !email || !phone || !address || !branchCode || balance < 0 || !region) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง");
      setLoading(false);
      return;
    }

    storage.insertClient({
      name,
      email,
      phone,
      address,
      branch_code: branchCode,
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
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors"
      >
        <ArrowLeft size={16} />
        ย้อนกลับไปยังทะเบียนบัญชี
      </button>

      <Card elevated className="relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-blue-600 to-indigo-650" />
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-950/40 rounded-xl flex items-center justify-center text-blue-400 border border-blue-900/40">
            <UserPlus size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">เปิดบัญชีลูกค้าใหม่ (Add New Bank Client)</h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">กรอกข้อมูลผู้จดทะเบียนบัญชีด้านล่างให้ครบถ้วนเพื่อส่งประวัติ</p>
          </div>
        </div>

        <hr className="border-slate-800 my-5" />

        {/* Register Account Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Customer Full Name */}
          <div>
            <label className="bank-label">ชื่อ-นามสกุลลูกค้า (Full Name) *</label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email Address */}
            <div>
              <label className="bank-label">อีเมลติดต่อ (Email Address) *</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
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

            {/* Phone Number */}
            <div>
              <label className="bank-label">เบอร์โทรศัพท์ (Phone Number) *</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Phone size={16} />
                </div>
                <input
                  type="tel"
                  placeholder="เช่น 089-123-4567"
                  className="bank-input pl-10"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="bank-label">ที่อยู่ตามทะเบียนบ้าน/ติดต่อ (Address) *</label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute top-3 left-3.5 flex items-start pointer-events-none text-slate-500">
                <MapPin size={16} />
              </div>
              <textarea
                placeholder="เช่น บ้านเลขที่ 123/4 ถนนสุขุมวิท อ.เมือง จ.กรุงเทพฯ"
                className="bank-input pl-10 h-20 resize-none py-2"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Branch Code */}
            <div>
              <label className="bank-label">รหัสสาขา (Branch Code) *</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Building size={16} />
                </div>
                <input
                  type="text"
                  placeholder="เช่น 101, 202"
                  className="bank-input pl-10"
                  value={branchCode}
                  onChange={(e) => setBranchCode(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Region / Branch Name */}
            <div>
              <label className="bank-label">ชื่อสาขาที่เปิดบัญชี (Branch Name) *</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Globe size={16} />
                </div>
                <input
                  type="text"
                  placeholder="เช่น สำนักงานใหญ่, สาขาพัทยาใต้"
                  className="bank-input pl-10"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Initial Balance */}
          <div>
            <label className="bank-label">ยอดเงินฝากเริ่มต้น (Initial Deposit) *</label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
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

          <hr className="border-slate-800 my-6" />

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
