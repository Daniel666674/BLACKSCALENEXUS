import { NextResponse } from 'next/server';

const KEY = process.env.BREVO_API_KEY || '';
const H = { 'api-key': KEY, 'Content-Type': 'application/json' };

async function listCampaigns(status: string) {
  const r = await fetch(`https://api.brevo.com/v3/emailCampaigns?limit=50&offset=0&status=${status}`, { headers: H });
  const d = await r.json();
  return (d.campaigns || []) as any[];
}

async function getCampaignDetail(id: number) {
  const r = await fetch(`https://api.brevo.com/v3/emailCampaigns/${id}`, { headers: H });
  return r.json();
}

export async function GET() {
  try {
    const [sent, scheduled, draft] = await Promise.all([
      listCampaigns('sent'),
      listCampaigns('scheduled'),
      listCampaigns('draft'),
    ]);
    const all = [...sent, ...scheduled, ...draft];

    // Fetch full details (with statistics) for each campaign in parallel
    const detailed = await Promise.all(all.map(c => getCampaignDetail(c.id)));

    return NextResponse.json({ campaigns: detailed });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
