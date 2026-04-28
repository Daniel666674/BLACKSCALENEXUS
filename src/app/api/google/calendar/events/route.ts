import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUpcomingEvents } from "@/lib/google-calendar";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const events = await getUpcomingEvents(session.user.id);
    return NextResponse.json({ events });
  } catch (err) {
    console.error("[calendar events]", err);
    return NextResponse.json({ events: [], error: "No conectado o tokens expirados" });
  }
}
