import { google } from "googleapis";
import { db } from "@/db";
import { analyticsCache } from "@/db/schema";
import { eq } from "drizzle-orm";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function getAnalyticsClient() {
  const raw = process.env.GA4_CREDENTIALS;
  if (!raw) throw new Error("GA4_CREDENTIALS not set");
  let credentials: unknown;
  try {
    credentials = JSON.parse(Buffer.from(raw, "base64").toString("utf-8"));
  } catch {
    throw new Error("GA4_CREDENTIALS is not valid base64-encoded JSON");
  }
  const auth = new google.auth.GoogleAuth({
    credentials: credentials as Record<string, unknown>,
    scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
  });
  return google.analyticsdata({ version: "v1beta", auth });
}

export interface GA4Report {
  sessions: number;
  pageviews: number;
  topPages: Array<{ page: string; views: number }>;
  trafficSources: Array<{ source: string; sessions: number }>;
  fetchedAt: string;
}

export async function getGA4Report(): Promise<GA4Report | null> {
  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!propertyId) return null;

  // Return cache if fresh
  const cached = db.select().from(analyticsCache).where(eq(analyticsCache.id, "ga4")).get();
  if (cached) {
    const age = Date.now() - new Date(cached.cachedAt).getTime();
    if (age < CACHE_TTL_MS) return JSON.parse(cached.data) as GA4Report;
  }

  try {
    const analytics = getAnalyticsClient();

    const [overview, pages, sources] = await Promise.all([
      analytics.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
          dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
          metrics: [{ name: "sessions" }, { name: "screenPageViews" }],
        },
      }),
      analytics.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
          dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
          dimensions: [{ name: "pagePath" }],
          metrics: [{ name: "screenPageViews" }],
          orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
          limit: "10",
        },
      }),
      analytics.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
          dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
          dimensions: [{ name: "sessionSource" }],
          metrics: [{ name: "sessions" }],
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
          limit: "8",
        },
      }),
    ]);

    const row0 = overview.data.rows?.[0];
    const report: GA4Report = {
      sessions: parseInt(row0?.metricValues?.[0]?.value ?? "0", 10),
      pageviews: parseInt(row0?.metricValues?.[1]?.value ?? "0", 10),
      topPages: (pages.data.rows ?? []).map((r) => ({
        page: r.dimensionValues?.[0]?.value ?? "/",
        views: parseInt(r.metricValues?.[0]?.value ?? "0", 10),
      })),
      trafficSources: (sources.data.rows ?? []).map((r) => ({
        source: r.dimensionValues?.[0]?.value ?? "(direct)",
        sessions: parseInt(r.metricValues?.[0]?.value ?? "0", 10),
      })),
      fetchedAt: new Date().toISOString(),
    };

    // Cache result
    db.insert(analyticsCache)
      .values({ id: "ga4", data: JSON.stringify(report) })
      .onConflictDoUpdate({ target: analyticsCache.id, set: { data: JSON.stringify(report), cachedAt: new Date() } })
      .run();

    return report;
  } catch (err) {
    console.error("[GA4]", err);
    return cached ? JSON.parse(cached.data) : null;
  }
}
