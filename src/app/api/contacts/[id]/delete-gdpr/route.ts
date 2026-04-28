import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { contacts, deals, activities, auditLog } from "@/db/schema";
import { eq } from "drizzle-orm";
import { writeAuditLog, getClientIp } from "@/lib/audit";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const contact = db.select().from(contacts).where(eq(contacts.id, id)).get();
  if (!contact) return NextResponse.json({ error: "Contacto no encontrado" }, { status: 404 });

  // Caller must confirm by typing the contact's full name
  if (!body.confirm || body.confirm.trim().toLowerCase() !== contact.name.trim().toLowerCase()) {
    return NextResponse.json(
      { error: "Confirmación incorrecta. Escribe el nombre completo del contacto." },
      { status: 400 }
    );
  }

  const reason = body.reason ?? "Solicitud de supresión Ley 1581";
  const ip = getClientIp(req);
  const registerId = crypto.randomUUID();

  // Hard delete in order to satisfy FK constraints
  db.delete(activities).where(eq(activities.contactId, id)).run();
  db.delete(deals).where(eq(deals.contactId, id)).run();
  db.delete(contacts).where(eq(contacts.id, id)).run();

  // Write to audit log — this record must persist after the contact is gone
  db.insert(auditLog)
    .values({
      id: registerId,
      userName: session.user.email,
      action: "contact_deleted",
      entityType: "contact",
      entityId: id,
      detailsJson: JSON.stringify({
        name: contact.name,
        email: contact.email,
        reason,
        deletedAt: new Date().toISOString(),
      }),
      ipAddress: ip,
    })
    .run();

  return NextResponse.json({ ok: true, registerId });
}
