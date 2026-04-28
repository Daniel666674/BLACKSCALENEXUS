import { db } from "@/db";
import { auditLog } from "@/db/schema";

export type AuditAction =
  | "login_success"
  | "login_failed"
  | "contact_viewed"
  | "contact_edited"
  | "contact_deleted"
  | "data_exported"
  | "deal_created"
  | "deal_edited"
  | "deal_stage_changed"
  | "settings_accessed";

export function writeAuditLog(opts: {
  userName: string;
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}) {
  try {
    db.insert(auditLog)
      .values({
        userName: opts.userName,
        action: opts.action,
        entityType: opts.entityType ?? null,
        entityId: opts.entityId ?? null,
        detailsJson: opts.details ? JSON.stringify(opts.details) : null,
        ipAddress: opts.ipAddress ?? null,
      })
      .run();
  } catch (err) {
    // Audit failures must never crash the main flow
    console.error("[audit]", err);
  }
}

export function getClientIp(req: Request): string {
  return (
    (req.headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}
