import { NextResponse } from 'next/server';

const BDA_PROXY_URL = process.env.BDA_PROXY_URL || 'https://pb.banwelldesigns.com/bda/run';
const BDA_PROXY_USER = process.env.BDA_PROXY_USER || 'erin';
const BDA_PROXY_PASSWORD = process.env.BDA_PROXY_PASSWORD || '';

export async function POST() {
  if (!BDA_PROXY_PASSWORD) {
    return NextResponse.json({ success: false, error: 'BDA_PROXY_PASSWORD not configured' }, { status: 500 });
  }

  try {
    const basicAuth = Buffer.from(`${BDA_PROXY_USER}:${BDA_PROXY_PASSWORD}`).toString('base64');
    // qualifyLeads can take 1-5 min for big batches; use detach for consistency
    const res = await fetch(`${BDA_PROXY_URL}/qualifyLeads?detach=1`, {
      method: 'GET',
      headers: { Authorization: `Basic ${basicAuth}` },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ success: false, error: `Upstream ${res.status}: ${text.slice(0, 200)}` }, { status: 502 });
    }
    return NextResponse.json({
      success: true,
      message: 'Qualify started in background. Researched leads will advance to Qualified (or dead) within a few minutes.',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
