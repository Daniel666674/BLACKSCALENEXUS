import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getGA4Report } from "@/lib/google-analytics";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const report = await getGA4Report();
  if (!report) {
    return NextResponse.json(
      { error: "GA4 no configurado. Verifica GA4_PROPERTY_ID y GA4_CREDENTIALS." },
      { status: 503 }
    );
  }

  return NextResponse.json(report);
}
