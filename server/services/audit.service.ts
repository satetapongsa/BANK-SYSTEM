// server/services/audit.service.ts
import { getFallbackState, withFallbackTx } from "../db/fallback-engine";
import { DbAuditLog } from "../db/types";

export interface LogAuditParams {
  actorUserId?: number | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  beforeData?: Record<string, any> | null;
  afterData?: Record<string, any> | null;
  reason?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function logAudit(params: LogAuditParams): Promise<DbAuditLog> {
  const newLog: DbAuditLog = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    actor_user_id: params.actorUserId ?? null,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId ?? null,
    before_data: params.beforeData ?? null,
    after_data: params.afterData ?? null,
    reason: params.reason ?? null,
    ip_address: params.ipAddress ?? "127.0.0.1",
    user_agent: params.userAgent ?? "Web/Client",
    created_at: new Date().toISOString(),
  };

  await withFallbackTx(async ({ state }) => {
    state.audit_logs.unshift(newLog);
  });

  return newLog;
}

export async function getAuditLogs(options?: {
  actorId?: number;
  action?: string;
  entityType?: string;
  limit?: number;
  offset?: number;
}) {
  const state = getFallbackState();
  let logs = [...state.audit_logs];

  if (options?.actorId) {
    logs = logs.filter((l) => l.actor_user_id === options.actorId);
  }
  if (options?.action) {
    logs = logs.filter((l) => l.action.toLowerCase().includes(options.action!.toLowerCase()));
  }
  if (options?.entityType) {
    logs = logs.filter((l) => l.entity_type === options.entityType);
  }

  // Sort descending by date
  logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const total = logs.length;
  const offset = options?.offset || 0;
  const limit = options?.limit || 50;
  const paginatedLogs = logs.slice(offset, offset + limit);

  return {
    logs: paginatedLogs,
    total,
    offset,
    limit,
  };
}
