// app/settings/page.tsx
"use client";
import { useEffect, useState } from "react";
import Card from "@/app/components/Card";
import Button from "@/app/components/Button";
import * as storage from "@/app/lib/storage";

export default function SettingsPage() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    setIsAdmin(localStorage.getItem("isAdmin") === "true");
  }, []);

  const toggleAdmin = () => {
    const newVal = !isAdmin;
    setIsAdmin(newVal);
    if (newVal) localStorage.setItem("isAdmin", "true");
    else localStorage.removeItem("isAdmin");
  };

  const resetData = () => {
    if (confirm("ลบข้อมูลทั้งหมดและรีเซ็ตระบบ?") ) {
      localStorage.clear();
      // reload to reflect changes
      window.location.reload();
    }
  };

  return (
    <Card className="mt-6">
      <h2 className="text-2xl font-bold mb-4 text-glow-blue" style={{ color: "#f0f6fc" }}>Settings</h2>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="admin"
            checked={isAdmin}
            onChange={toggleAdmin}
            className="input-dark"
          />
          <label htmlFor="admin" className="text-sm" style={{ color: "#8b949e" }}>Admin mode</label>
        </div>
        <Button onClick={resetData} className="btn" style={{ background: "linear-gradient(135deg, #d73a49, #e55353)" }}>
          รีเซ็ตข้อมูลทั้งหมด
        </Button>
      </div>
    </Card>
  );
}
