// app/clients/new/page.tsx
"use client";
import { useState } from "react";
import * as storage from "@/app/lib/storage";
import Card from "@/app/components/Card";
import Button from "@/app/components/Button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AddClientPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [balance, setBalance] = useState(0);
  const [region, setRegion] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    storage.insertClient({
      name,
      email,
      account_number: storage.generateAccountNumber(),
      balance,
      status: "Active",
      region,
    });
    router.push("/clients");
  };

  return (
    <Card className="mt-6">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm mb-4" style={{ color: "#8b949e" }}>
        <ArrowLeft size={14} /> ย้อนกลับ
      </button>
      <h2 className="text-2xl font-bold mb-4 text-glow-blue" style={{ color: "#f0f6fc" }}>เพิ่มลูกค้า</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="ชื่อ"
          className="input-dark w-full"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="อีเมล"
          className="input-dark w-full"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="ยอดคงเหลือ"
          className="input-dark w-full"
          value={balance}
          onChange={e => setBalance(parseFloat(e.target.value) || 0)}
          required
        />
        <input
          type="text"
          placeholder="ภูมิภาค"
          className="input-dark w-full"
          value={region}
          onChange={e => setRegion(e.target.value)}
          required
        />
        <Button type="submit" className="btn w-full">สร้างลูกค้า</Button>
      </form>
    </Card>
  );
}
