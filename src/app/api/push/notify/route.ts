import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notifyContactHot, notifyDealStageChanged, sendDailyBriefing } from "@/lib/push";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }
  const { type, ...data } = body;

  switch (type) {
    case "contact_hot":
      await notifyContactHot(data.contactId as string, data.contactName as string);
      break;
    case "deal_stage_changed":
      await notifyDealStageChanged(data.dealId as string, data.dealTitle as string, data.stageName as string);
      break;
    case "daily_briefing":
      await sendDailyBriefing();
      break;
    default:
      return NextResponse.json({ error: "Tipo desconocido" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
