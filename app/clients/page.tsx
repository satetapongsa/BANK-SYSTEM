// app/clients/page.tsx
"use client";
import { useEffect, useState } from "react";
import * as storage from "@/app/lib/storage";
import Card from "@/app/components/Card";
import Button from "@/app/components/Button";
import { Trash2, Edit } from "lucide-react";

export default function ClientsPage() {
  const [clients, setClients] = useState<storage.Client[]>([]);

  useEffect(() => {
    setClients(storage.getClients());
  }, []);

  const handleDelete = (id: number) => {
    storage.deleteClient(id);
    setClients(storage.getClients());
  };

  return (
    <Card className="mt-6">
      <h2 className="text-2xl font-bold mb-4 text-glow-blue" style={{ color: "#f0f6fc" }}>Clients</h2>
      {clients.length === 0 ? (
        <p className="text-muted" style={{ color: "#8b949e" }}>No clients found.</p>
      ) : (
        <table className="table-auto">
          <thead>
            <tr>
              <th className="px-4 py-2" style={{ color: "#484f58" }}>ID</th>
              <th className="px-4 py-2" style={{ color: "#484f58" }}>Name</th>
              <th className="px-4 py-2" style={{ color: "#484f58" }}>Email</th>
              <th className="px-4 py-2" style={{ color: "#484f58" }}>Balance</th>
              <th className="px-4 py-2" style={{ color: "#484f58" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-b border-white/5">
                <td className="px-4 py-2" style={{ color: "#8b949e" }}>{c.id}</td>
                <td className="px-4 py-2" style={{ color: "#4f9cf9" }}>{c.name}</td>
                <td className="px-4 py-2" style={{ color: "#4f9cf9" }}>{c.email}</td>
                <td className="px-4 py-2" style={{ color: "#4f9cf9" }}>฿{Number(c.balance).toLocaleString()}</td>
                <td className="px-4 py-2 flex gap-2">
                  {/* Edit action placeholder */}
                  <Button className="btn" disabled>
                    <Edit size={14} />
                  </Button>
                  <Button onClick={() => handleDelete(c.id)} className="btn" style={{ background: "linear-gradient(135deg, #d73a49, #e55353)" }}>
                    <Trash2 size={14} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}
