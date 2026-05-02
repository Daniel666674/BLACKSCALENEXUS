import { NextResponse } from "next/server";
import { mktDb } from "@/db/mkt-db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// DELETE all marketing contacts and campaigns that are NOT from Brevo (no brevo_id)
// Only superadmin can run this.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "superadmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));

  if (body.confirm !== "PURGE_DEMO_DATA") {
    return NextResponse.json({
      error: 'Send { "confirm": "PURGE_DEMO_DATA" } to confirm deletion',
    }, { status: 400 });
  }

  const deletedContacts = mktDb
    .prepare("DELETE FROM mkt_contacts WHERE brevo_id = '' OR brevo_id IS NULL")
    .run();

  const deletedCampaigns = mktDb
    .prepare("DELETE FROM mkt_campaigns WHERE brevo_campaign_id = '' OR brevo_campaign_id IS NULL")
    .run();

  return NextResponse.json({
    success: true,
    deletedContacts: deletedContacts.changes,
    deletedCampaigns: deletedCampaigns.changes,
    message: "Demo data purged. Run POST /api/brevo/sync to load real contacts.",
  });
}
