import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { contacts, deals, activities, pipelineStages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { writeAuditLog, getClientIp } from "@/lib/audit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;

  const contact = db.select().from(contacts).where(eq(contacts.id, id)).get();
  if (!contact) return NextResponse.json({ error: "Contacto no encontrado" }, { status: 404 });

  const contactDeals = db
    .select({
      id: deals.id,
      title: deals.title,
      value: deals.value,
      probability: deals.probability,
      notes: deals.notes,
      expectedClose: deals.expectedClose,
      createdAt: deals.createdAt,
      updatedAt: deals.updatedAt,
      stageName: pipelineStages.name,
    })
    .from(deals)
    .leftJoin(pipelineStages, eq(deals.stageId, pipelineStages.id))
    .where(eq(deals.contactId, id))
    .all();

  const contactActivities = db.select().from(activities).where(eq(activities.contactId, id)).all();

  const exportData = {
    exportedAt: new Date().toISOString(),
    exportedBy: session.user.email,
    subject: "Datos personales conforme a Ley 1581 de 2012",
    contact: {
      id: contact.id,
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      source: contact.source,
      temperature: contact.temperature,
      score: contact.score,
      notes: contact.notes,
      engagementStatus: contact.engagementStatus,
      consentGiven: contact.consentGiven,
      consentDate: contact.consentDate,
      consentSource: contact.consentSource,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
    },
    deals: contactDeals,
    activities: contactActivities,
  };

  writeAuditLog({
    userName: session.user.email,
    action: "data_exported",
    entityType: "contact",
    entityId: id,
    details: { contactName: contact.name },
    ipAddress: getClientIp(req),
  });

  const filename = `${contact.name.replace(/[^a-z0-9]/gi, "_")}_datos_blackscale.json`;

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
