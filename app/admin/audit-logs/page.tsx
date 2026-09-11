// app/admin/audit-logs/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { ShieldAlert, Search, ChevronLeft, ChevronRight, Eye } from "lucide-react";

interface AuditLogItem {
  id: number;
  actor_user_id?: number | null;
  actor_email: string;
  actor_name: string;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  before_data?: any;
  after_data?: any;
  reason?: string | null;
  ip_address?: string;
  created_at: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const limit = 20;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * limit;
      let url = `/api/admin/audit-logs?limit=${limit}&offset=${offset}`;
      if (actionFilter.trim()) url += `&action=${encodeURIComponent(actionFilter.trim())}`;

      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setLogs(json.data.auditLogs || []);
        setTotal(json.data.total || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter]);

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6 animate-fade-in py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="text-purple-600 dark:text-purple-400" size={24} />
            ประวัติการตรวจสอบความปลอดภัย (Immutable Audit Trail)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            บันทึกกิจกรรมที่มีผลต่อยอดเงิน สถานะบัญชี และการดำเนินการของผู้ดูแลระบบทั้งหมด
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3.5 top-2.5 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="กรองตามกิจกรรม เช่น TRANSFER, LOGIN..."
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-5">เวลา / ผู้ดำเนินการ</th>
                <th className="py-3 px-4">กิจกรรม (Action)</th>
                <th className="py-3 px-4">เป้าหมาย (Entity)</th>
                <th className="py-3 px-4">เหตุผล / บันทึก</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-5 text-right">รายละเอียด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    กำลังโหลดประวัติการตรวจสอบ...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    ไม่พบบันทึก Audit Log
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-5">
                      <p className="font-bold text-slate-900 dark:text-slate-100">{log.actor_email}</p>
                      <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                        {new Date(log.created_at).toLocaleString("th-TH")}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase">{log.entity_type}: </span>
                      {log.entity_id || "-"}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 max-w-[220px] truncate">
                      {log.reason || "-"}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 dark:text-slate-500">
                      {log.ip_address || "127.0.0.1"}
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:text-purple-700 hover:bg-slate-200 transition-colors"
                        title="ดูรายละเอียด Diff"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            แสดง {logs.length} จาก {total} บันทึก (หน้า {page}/{totalPages})
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Detail JSON Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              รายละเอียด Audit Log #{selectedLog.id}
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-mono">
              Action: {selectedLog.action} • {selectedLog.actor_email}
            </p>

            <div className="space-y-3 text-xs max-h-96 overflow-y-auto font-mono">
              {selectedLog.before_data && (
                <div>
                  <span className="text-slate-600 font-bold block mb-1">Before Snapshot:</span>
                  <pre className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-[11px] overflow-x-auto">
                    {JSON.stringify(selectedLog.before_data, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.after_data && (
                <div>
                  <span className="text-slate-600 font-bold block mb-1">After Snapshot:</span>
                  <pre className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-blue-700 text-[11px] overflow-x-auto">
                    {JSON.stringify(selectedLog.after_data, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 mt-4 border-t border-slate-200">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
