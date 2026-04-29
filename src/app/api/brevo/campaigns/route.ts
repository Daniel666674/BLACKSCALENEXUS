import { NextResponse } from 'next/server';

const API_KEY = process.env.BREVO_API_KEY || '';
const HEADERS = { 'api-key': API_KEY, 'Content-Type': 'application/json' };

async function fetchCampaigns(status: string) {
  const res = await fetch(
    `https://api.brevo.com/v3/emailCampaigns?limit=50&offset=0&status=${status}&statistics=true`,
    { headers: HEADERS }
  );
  const data = await res.json();
  return data.campaigns || [];
}

export async function GET() {
  try {
    const [sent, scheduled, draft] = await Promise.all([
      fetchCampaigns('sent'),
      fetchCampaigns('scheduled'),
      fetchCampaigns('draft'),
    ]);
    const all = [...sent, ...scheduled, ...draft];
    return NextResponse.json({ campaigns: all });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
