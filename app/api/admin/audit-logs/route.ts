// app/api/admin/audit-logs/route.ts
import { NextRequest } from "next/server";
import { requireAdmin, apiSuccess } from "@/server/security/guard";
import { getAuditLogs } from "@/server/services/audit.service";
import { getFallbackState } from "@/server/db/fallback-engine";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if ("errorResponse" in auth) return auth.errorResponse;

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action") || undefined;
  const entityType = searchParams.get("entityType") || undefined;
  const actorIdParam = searchParams.get("actorId");
  const actorId = actorIdParam ? parseInt(actorIdParam, 10) : undefined;
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  const result = await getAuditLogs({
    action,
    entityType,
    actorId,
    limit,
    offset,
  });

  // Enrich with actor email for admin convenience
  const state = getFallbackState();
  const enriched = result.logs.map((log) => {
    const actor = log.actor_user_id ? state.users.find((u) => u.id === log.actor_user_id) : null;
    return {
      ...log,
      actor_email: actor ? actor.email : "System / Unknown",
      actor_name: actor ? `${actor.first_name} ${actor.last_name}` : "System / Public",
    };
  });

  return apiSuccess({
    auditLogs: enriched,
    total: result.total,
    limit: result.limit,
    offset: result.offset,
  });
}
