import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { contacts } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { writeAuditLog, getClientIp } from "@/lib/audit";

// GET — list contacts needing retention review
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const flagged = db
    .select()
    .from(contacts)
    .where(eq(contacts.retentionReviewNeeded, true))
    .all();

  const count = (
    db
      .select({ count: sql<number>`count(*)` })
      .from(contacts)
      .where(eq(contacts.retentionReviewNeeded, true))
      .get() as { count: number }
  ).count;

  return NextResponse.json({ contacts: flagged, count });
}

// POST — conservar (reset flag) or eliminar contact
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { contactId, action } = await req.json();
  if (!contactId || !["conservar", "eliminar"].includes(action)) {
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  }

  if (action === "conservar") {
    const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    db.update(contacts)
      .set({
        retentionReviewNeeded: false,
        retentionReviewDate: oneYearFromNow,
        updatedAt: new Date(),
      })
      .where(eq(contacts.id, contactId))
      .run();

    writeAuditLog({
      userName: session.user.email,
      action: "contact_edited",
      entityType: "contact",
      entityId: contactId,
      details: { action: "retention_conservar" },
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ ok: true });
  }

  // eliminar — hard delete (reuses the same logic)
  const { contacts: contactsTable, deals, activities } = await import("@/db/schema");
  const { eq: eqOp } = await import("drizzle-orm");
  db.delete(activities).where(eqOp(activities.contactId, contactId)).run();
  db.delete(deals).where(eqOp(deals.contactId, contactId)).run();
  db.delete(contactsTable).where(eqOp(contactsTable.id, contactId)).run();

  writeAuditLog({
    userName: session.user.email,
    action: "contact_deleted",
    entityType: "contact",
    entityId: contactId,
    details: { action: "retention_eliminar", reason: "Retención de datos vencida" },
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ ok: true });
}
