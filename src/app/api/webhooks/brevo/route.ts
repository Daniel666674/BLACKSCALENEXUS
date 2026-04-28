import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { handleBrevoWebhookEvent } from "@/lib/brevo";

function verifySignature(body: string, signature: string): boolean {
  const secret = process.env.BREVO_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(signature, "hex"));
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  const signature = req.headers.get("x-brevo-signature") ?? "";
  if (process.env.BREVO_WEBHOOK_SECRET && !verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const events = Array.isArray(payload) ? payload : [payload];

  for (const event of events) {
    if (typeof event === "object" && event !== null && "event" in event && "email" in event) {
      handleBrevoWebhookEvent(event as { event: string; email: string });
    }
  }

  return NextResponse.json({ ok: true });
}
