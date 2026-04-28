import { db } from "@/db";
import { contacts } from "@/db/schema";
import { eq } from "drizzle-orm";

const BREVO_API_KEY = process.env.BREVO_API_KEY ?? "";
const BASE_URL = "https://api.brevo.com/v3";

type EngagementStatus = "COLD" | "WARM" | "HOT" | "DEAD";

async function brevoFetch(path: string) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "api-key": BREVO_API_KEY,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error(`Brevo API ${res.status}: ${path}`);
  return res.json();
}

function updateContactEngagement(email: string, status: EngagementStatus, flag?: { needsEmailVerification?: boolean }) {
  const updates: Partial<{
    engagementStatus: string;
    needsEmailVerification: boolean;
    lastBrevoSync: Date;
    updatedAt: Date;
  }> = {
    engagementStatus: status,
    lastBrevoSync: new Date(),
    updatedAt: new Date(),
  };
  if (flag?.needsEmailVerification !== undefined) {
    updates.needsEmailVerification = flag.needsEmailVerification;
  }
  db.update(contacts)
    .set(updates)
    .where(eq(contacts.email, email))
    .run();
}

// Polling mode — called by cron job every 30 minutes
export async function pollBrevoCampaigns() {
  if (!BREVO_API_KEY) return;

  try {
    const { campaigns } = await brevoFetch("/emailCampaigns?status=sent&limit=50");
    if (!campaigns?.length) return;

    const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;

    for (const campaign of campaigns) {
      // Skip if recently polled
      const lastPolledAt = campaign.statistics?.lastOpenedAt
        ? new Date(campaign.statistics.lastOpenedAt).getTime()
        : 0;
      if (lastPolledAt > thirtyMinutesAgo) continue;

      try {
        const { recipients } = await brevoFetch(`/emailCampaigns/${campaign.id}/reports`);
        if (!recipients?.length) continue;

        for (const r of recipients) {
          if (!r.email) continue;
          const status: EngagementStatus =
            r.clickCount > 0 ? "HOT" :
            r.openCount > 0 ? "WARM" :
            "COLD";
          updateContactEngagement(r.email, status);
        }
      } catch {
        // Individual campaign failure shouldn't stop polling
      }
    }
  } catch (err) {
    console.error("[Brevo polling]", err);
  }
}

// Webhook mode — processes a single event
export function handleBrevoWebhookEvent(event: {
  event: string;
  email: string;
}) {
  const { event: eventType, email } = event;
  if (!email) return;

  switch (eventType) {
    case "email.opened":
      updateContactEngagement(email, "WARM");
      break;
    case "email.clicked":
      updateContactEngagement(email, "HOT");
      break;
    case "email.bounced":
    case "email.unsubscribed":
    case "email.complained":
      updateContactEngagement(email, "DEAD");
      break;
    case "email.softBounced":
      updateContactEngagement(email, "COLD", { needsEmailVerification: true });
      break;
  }
}
